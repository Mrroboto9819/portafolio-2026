// Liveness/readiness probe used by k8s/deployment.yaml. Intentionally cheap:
// no DB hop. Mongo connectivity is exercised on actual API calls — wiring the
// probe to it would crash-loop the pod whenever Mongo blips.
//
// Also reports the build version so `curl https://pablocabrera.dev/api/v1/health`
// is enough to confirm which build is live (matches the value the landing
// page footer renders).
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  return {
    status: 'healthy',
    version: config.public.appVersion,
    timestamp: new Date().toISOString(),
  }
})
