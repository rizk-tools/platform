import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, organization } from "better-auth/plugins"
import { db } from "@/db";
import { user, session, account, verification, apikey, organization as organizationTable, member, invitation } from "@/db/schema";
import { sendEmail } from "./email";
import { welcome } from "@rizk/emails"
import { render } from '@vue-email/render'

type SendVerificationEmailProps = {
  user: { email: string, name: string }
  url: string
  token: string
}

export const auth = betterAuth({
  basePath: "/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      apikey,
      organization: organizationTable,
      member,
      invitation
    }
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    sendVerificationEmail: async ({ user, url, token }: SendVerificationEmailProps, request: any) => {
      console.log("Sending verification email to", user.email);

      const html = await render(welcome, {
        email: user.email,
        name: user.name,
        url,
        token
      })

      console.log("HTML", html);

      await sendEmail(user.email, "Verify your email address", html);
    },
  },
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    apiKey(),
    organization({
      async sendInvitationEmail (data) {
        const inviteLink = `https://example.com/accept-invitation/${data.id}`
        sendEmail(
          data.email,
          `Invitation to join ${data.organization.name}`,
          `You've been invited to join ${data.organization.name} by ${data.inviter.user.name} (${data.inviter.user.email}). Click here to accept: ${inviteLink}`
        )
      },
    })
  ]
});