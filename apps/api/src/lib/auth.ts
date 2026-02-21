import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db/client";
import { env } from "@/lib/env";
import * as schema from "@/db/schema/index";

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
      // In development, log the reset link so you can test without an email provider.
      // For production, plug in Resend, SendGrid, nodemailer, etc. and send the email.
      if (process.env.NODE_ENV === "development") {
        console.log("[Password reset] Link for", user.email, ":", url);
      }
      // Optional: use env to enable real email (e.g. RESEND_API_KEY) and send here.
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
