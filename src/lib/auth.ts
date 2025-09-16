import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import nodemailer from "nodemailer";
import { prisma } from "./prisma";

// Custom email transport using nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // Custom sendVerificationRequest function
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);

        const result = await transporter.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign in to ${host}</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .button { display: inline-block; padding: 12px 24px; background: #007cba; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0; }
                  .footer { margin-top: 32px; font-size: 14px; color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Sign in to ${host}</h1>
                  <p>Click the link below to sign in to your account:</p>
                  <a href="${url}" class="button">Sign in</a>
                  <p>Or copy and paste this URL into your browser:</p>
                  <p><a href="${url}">${url}</a></p>
                  <div class="footer">
                    <p>If you didn't request this email, you can safely ignore it.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (result.rejected.length) {
          throw new Error("Email failed to send");
        }
      },
    }),
  ],
  session: {
    strategy: "database", // Use JWT for cookie-based sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user = {
          ...session.user,
          id: user.id,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // always redirect to dashboard after login
      return baseUrl + "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-request",
    error: "/error",
  },
};

import { getServerSession } from "next-auth";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}
