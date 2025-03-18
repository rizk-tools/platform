import { createFactory } from 'hono/factory'
import { auth } from '../lib/auth'

type Variables = {
  user: any
  session: any
}

const factory = createFactory<{ Variables: Variables }>()

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);


  await next()
})
