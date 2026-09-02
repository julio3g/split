import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '../env'
import { authPlugin } from './plugins/auth'
import { errorHandler } from './plugins/error-handler'
import { createCustomerRoute } from './routes/create-customer'
import { createProviderRoute } from './routes/create-provider'
import { createServiceRoute } from './routes/create-service'
import { createWorkspaceRoute } from './routes/create-workspace'
import { deleteCustomerRoute } from './routes/delete-customer'
import { deleteProviderRoute } from './routes/delete-provider'
import { deleteServiceRoute } from './routes/delete-service'
import { getAuthenticatedUserRoute } from './routes/get-authenticated-user'
import { getCustomerRoute } from './routes/get-customer'
import { getProviderRoute } from './routes/get-provider'
import { getServiceRoute } from './routes/get-service'
import { joinWorkspaceRoute } from './routes/join-workspace'
import { listCustomersRoute } from './routes/list-customers'
import { listProvidersRoute } from './routes/list-providers'
import { listServicesRoute } from './routes/list-services'
import { listWorkspaceMembersRoute } from './routes/list-workspace-members'
import { listWorkspacesRoute } from './routes/list-workspaces'
import { loginRoute } from './routes/login'
import { logoutRoute } from './routes/logout'
import { regenerateInviteCodeRoute } from './routes/regenerate-invite-code'
import { registerUserRoute } from './routes/register-user'
import { switchWorkspaceRoute } from './routes/switch-workspace'
import { updateCustomerRoute } from './routes/update-customer'
import { updateProviderRoute } from './routes/update-provider'
import { updateServiceRoute } from './routes/update-service'
import { updateServiceStatusRoute } from './routes/update-service-status'
import { updateWorkspaceRoute } from './routes/update-workspace'

export function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler(errorHandler)

  app.register(fastifyCors, { origin: env.CORS_ORIGIN, credentials: true })
  app.register(fastifyCookie)
  app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      statusCode: context.statusCode,
      message: 'Muitas requisições. Tente novamente em instantes.',
    }),
  })

  app.register(authPlugin)

  app.register(registerUserRoute)
  app.register(loginRoute)
  app.register(logoutRoute)
  app.register(getAuthenticatedUserRoute)

  app.register(createWorkspaceRoute)
  app.register(listWorkspacesRoute)
  app.register(switchWorkspaceRoute)
  app.register(joinWorkspaceRoute)
  app.register(updateWorkspaceRoute)
  app.register(regenerateInviteCodeRoute)
  app.register(listWorkspaceMembersRoute)

  app.register(createCustomerRoute)
  app.register(listCustomersRoute)
  app.register(getCustomerRoute)
  app.register(updateCustomerRoute)
  app.register(deleteCustomerRoute)

  app.register(createProviderRoute)
  app.register(listProvidersRoute)
  app.register(getProviderRoute)
  app.register(updateProviderRoute)
  app.register(deleteProviderRoute)

  app.register(createServiceRoute)
  app.register(listServicesRoute)
  app.register(getServiceRoute)
  app.register(updateServiceRoute)
  app.register(updateServiceStatusRoute)
  app.register(deleteServiceRoute)

  app.get('/', async () => ({ status: 'ok' }))

  return app
}
