import userRoutes from './routes/user'

export { RetrieveUserResult } from './lib/login/getUserByEmailOrPhone'
export { registerUser, RegisterUserResult } from './lib/register/registerUser'
export { type GetUserInfoResult, getUserInfo } from './lib/me/getUserInfo'
export { authMiddleware } from './lib/middleware/auth.middleware'
export { AuthenticatedRequest } from './lib/middleware/type'
export { type User } from './lib/user.dto'

export { userRoutes }