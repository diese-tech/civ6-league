// lib/auth.js
// ─── AUTHENTICATION CONFIG ──────────────────────────────────────────────────
// NextAuth with Discord OAuth + Email/Password credentials

import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";

export const authOptions = {
  providers: [
    // ── Discord OAuth ────────────────────────────────────────────────────
    // Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env
    ...(process.env.DISCORD_CLIENT_ID
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Email/Password ───────────────────────────────────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const player = await prisma.player.findUnique({
          where: { email: credentials.email },
        });

        if (!player || !player.password) return null;

        // In production, use bcrypt:
        // const bcrypt = require("bcryptjs");
        // const valid = await bcrypt.compare(credentials.password, player.password);
        // For demo, direct compare (REPLACE IN PRODUCTION)
        const valid = credentials.password === player.password;

        if (!valid) return null;

        return {
          id: String(player.id),
          name: player.username,
          email: player.email,
          isAdmin: player.isAdmin,
        };
      },
    }),
  ],

  callbacks: {
    // Attach player info to session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin || false;
      }

      // Handle Discord sign-in: link or create player
      if (account?.provider === "discord") {
        let player = await prisma.player.findUnique({
          where: { discordId: account.providerAccountId },
        });

        if (!player) {
          player = await prisma.player.create({
            data: {
              username: token.name || `Player_${Date.now()}`,
              email: token.email,
              discordId: account.providerAccountId,
              discordTag: token.name,
              avatarUrl: token.picture,
            },
          });
        }

        token.id = String(player.id);
        token.isAdmin = player.isAdmin;
      }

      return token;
    },
  },

  pages: {
    signIn: "/join",
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
};
