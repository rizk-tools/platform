import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, organization } from "better-auth/plugins"
import { db } from "@/db";
import { user, session, account, verification, apikey } from "@/db/schema";

export const auth = betterAuth({
  basePath: "/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      apikey
    }
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6
  },
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    apiKey(),
    organization()
  ]
});