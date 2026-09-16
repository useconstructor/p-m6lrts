import { jwtVerify } from 'jose'
export const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-in-prod')
export async function currentUser(req: Request) {
  const token = (req.headers.get('cookie') ?? '').split(';').find(c => c.trim().startsWith('session='))?.split('=')[1]
  if (!token) return null
  try { return (await jwtVerify(token, secret)).payload } catch { return null }
}
