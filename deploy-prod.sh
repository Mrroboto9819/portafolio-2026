#!/usr/bin/env bash
# deploy-prod.sh — manual deploy of portafolio-2026 to k3s.
#
# Pattern lifted from reedley-hay-v1: builds locally, ships the tarball into
# an in-cluster runner pod that has access to the k3s containerd socket,
# imports the image into the kubelet's image cache, then applies manifests
# and forces a rollout.
#
# Requirements:
#   - docker (or any OCI builder)
#   - kubectl with cluster access
#   - A running github-runner pod with the k3s containerd socket mounted.
#     Tries the violet-vault namespace first (shared runner, same as
#     reedley-hay-v1), falls back to portafolio if a dedicated runner exists.
#
# First-deploy notes:
#   - Create the Mongo user/DB out-of-band before the first deploy:
#       mongosh "<admin URI>"
#       use portafolio
#       db.createUser({ user: "portafolio_user", pwd: "<pw>",
#                       roles: [{ role: "readWrite", db: "portafolio" }] })
#   - Edit k8s/secret.yaml and replace every CHANGE_ME (Mongo pw, ADMIN_PASSWORD,
#     JWT_ACCESS_SECRET, JWT_REFRESH_SECRET).
#   - On first boot the app seeds the `users` collection with ADMIN_USERNAME /
#     ADMIN_PASSWORD and seeds content collections from the legacy hardcoded
#     arrays. Subsequent boots skip seeding.

set -euo pipefail

IMAGE="portafolio-2026:latest"
TAR="/tmp/portafolio-2026.tar"
APP_NS="portafolio"
APP="portafolio"
RUNNER_LABEL="app=github-runner"
CONTAINERD_SOCK="/run/k3s/containerd/containerd.sock"

cd "$(dirname "$0")"

step() { printf '\n\033[1;36m> %s\033[0m\n' "$*"; }
ok()   { printf '  \033[0;32mOK\033[0m %s\n' "$*"; }
warn() { printf '  \033[0;33m!\033[0m %s\n' "$*"; }
fail() { printf '  \033[0;31mFAIL %s\033[0m\n' "$*"; exit 1; }

# 0. Sanity
step "Pre-flight"
command -v docker  >/dev/null || fail "docker not in PATH"
command -v kubectl >/dev/null || fail "kubectl not in PATH"
ok "docker + kubectl present"

# 1. Build
# Derive version components for nuxt.config.ts to format as
#   <env>-v<pkg.version>-<DD-MM-YYYY>-build:<sha>
# pkg.version comes from package.json (read by nuxt.config inside the build).
# APP_ENV defaults to "local" unless overridden (e.g. APP_ENV=production ./deploy-prod.sh).
SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
DIRTY=$(git diff --quiet 2>/dev/null && echo "" || echo "-dirty")
APP_ENV="${APP_ENV:-local}"
APP_COMMIT="${APP_COMMIT:-${SHORT_SHA}${DIRTY}}"

step "Building $IMAGE  ($APP_ENV-v\$(pkg.version)-<today>-build:$APP_COMMIT)"
docker build \
  --build-arg "APP_ENV=$APP_ENV" \
  --build-arg "APP_COMMIT=$APP_COMMIT" \
  -t "$IMAGE" .
ok "built"

# 2. Save tarball
step "Saving to $TAR"
docker save "$IMAGE" -o "$TAR"
ok "$(du -h "$TAR" | awk '{print $1}') tarball ready"

# 3. Locate a runner pod (try portafolio ns, fall back to violet-vault)
step "Finding github-runner pod"
RUNNER_NS="$APP_NS"
RUNNER=$(kubectl get pod -n "$RUNNER_NS" -l "$RUNNER_LABEL" \
  -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' 2>/dev/null | awk '{print $1}')
if [ -z "${RUNNER:-}" ]; then
  warn "No runner in $RUNNER_NS, falling back to violet-vault"
  RUNNER_NS="violet-vault"
  RUNNER=$(kubectl get pod -n "$RUNNER_NS" -l "$RUNNER_LABEL" \
    -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' | awk '{print $1}')
fi
[ -z "${RUNNER:-}" ] && fail "No running runner pod found"
ok "Using $RUNNER_NS/$RUNNER"

# 4. Copy + import into k3s containerd
step "Uploading tarball to runner"
kubectl cp "$TAR" "$RUNNER_NS/$RUNNER:/tmp/portafolio-2026.tar"
ok "copied"

step "Importing into containerd (k8s.io)"
kubectl exec -n "$RUNNER_NS" "$RUNNER" -- \
  ctr --address "$CONTAINERD_SOCK" -n k8s.io images import /tmp/portafolio-2026.tar
kubectl exec -n "$RUNNER_NS" "$RUNNER" -- rm -f /tmp/portafolio-2026.tar
ok "image available to kubelet"

# 5. One-time cleanup of legacy 'portafolio-svc' / 'portafolio-ing' from the
#    old port-3001 deployment. Safe to re-run; --ignore-not-found keeps it idempotent.
step "Removing legacy svc/ingress (if present)"
kubectl delete service portafolio-svc -n "$APP_NS" --ignore-not-found
kubectl delete ingress portafolio-ing -n "$APP_NS" --ignore-not-found
ok "legacy objects removed"

# 6. Apply manifests
step "Applying manifests"
kubectl apply -f k8s/namespace.yaml  && ok "namespace"
kubectl apply -f k8s/secret.yaml     && ok "secret"
kubectl apply -f k8s/deployment.yaml && ok "deployment"
kubectl apply -f k8s/service.yaml    && ok "service"
kubectl apply -f k8s/ingress.yaml    && ok "ingress"

# 7. Force restart so the new image is picked up (same :latest tag)
step "Restarting pod"
kubectl delete pod -n "$APP_NS" -l "app=$APP" --ignore-not-found
kubectl rollout status deployment/"$APP" -n "$APP_NS" --timeout=180s

# 8. Cleanup
rm -f "$TAR"

printf '\n\033[1;32mDeploy complete.\033[0m  https://pablocabrera.dev\n'
