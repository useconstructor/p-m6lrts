import { db } from '@/lib/db'; import bcrypt from 'bcryptjs'; import { SignJWT } from 'jose'; import { secret } from '@/lib/auth'
export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return Response.json({ error: 'Email and password required' }, { status: 400 })
  await db.execute(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`)
  let user = (await db.execute({ sql:'SELECT * FROM users WHERE email=?', args:[email] })).rows[0]
  if (!user && email === process.env.ADMIN_EMAIL) { const hash = await bcrypt.hash(password, 12); await db.execute({ sql:'INSERT INTO users (email,name,password_hash) VALUES (?,?,?)', args:[email,'Admin',hash] }); user = (await db.execute({sql:'SELECT * FROM users WHERE email=?',args:[email]})).rows[0] }
  if (!user || !await bcrypt.compare(password, String(user.password_hash))) return Response.json({ error:'Invalid credentials' }, { status:401 })
  const isAdmin = email === process.env.ADMIN_EMAIL
  const token = await new SignJWT({ email, name:String(user.name), isAdmin }).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(secret)
  return new Response(JSON.stringify({ok:true,email,isAdmin}), {headers:{'Content-Type':'application/json','Set-Cookie':`session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800; Secure`}})
}
