import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";

import { db } from "@/db/client";
import { env } from "@/lib/env";
import * as schema from "@/db/schema/index";

const resend =
  env.RESEND_API_KEY && env.EMAIL_DOMAIN
    ? new Resend(env.RESEND_API_KEY)
    : null;

const FROM_EMAIL = env.EMAIL_DOMAIN
  ? `FleetFlow <noreply@${env.EMAIL_DOMAIN.replace(/^\.+/, "")}>`
  : "FleetFlow <noreply@example.com>";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (resend) {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset your FleetFlow password",
          html: `
            <p>Hi${user.name ? ` ${user.name}` : ""},</p>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p><a href="${url}" style="color:#2563eb;text-decoration:underline;">Reset password</a></p>
            <p>If you didn't request this, you can ignore this email. The link expires in 1 hour.</p>
            <p>— FleetFlow</p>
          `,
        });
        if (error) {
          console.error("[Resend] Password reset email failed:", error);
          throw new Error("Failed to send reset email");
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log("[Password reset] Link for", user.email, ":", url);
        }
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "dispatcher",
        input: true,
      },
    },
  },
});
