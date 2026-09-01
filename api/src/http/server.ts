import { env } from '../env'
import { buildApp } from './app'

const app = buildApp()

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    console.log(`HTTP server running on port ${env.PORT}`)
  })
  .catch(error => {
    app.log.error(error)
    process.exit(1)
  })
