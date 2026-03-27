// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";

export const authOptions = {
  providers: [
    ...(process.env.DISCORD_CLIENT_ID
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          }),
        ]
      : []),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const player = await prisma.player.findUnique({ where: { email: credentials.email } });
        if (!player || !player.password) return null;
        const valid = credentials.password === player.password;
        if (!valid) return null;
        return { id: String(player.id), name: player.username, email: player.email, isAdmin: player.isAdmin };
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.discordId = token.discordId;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin || false;
      }

      if (account?.provider === "discord") {
        let player = await prisma.player.findUnique({
          where: { discordId: account.providerAccountId },
        });

        if (!player) {
          // Check if a player with this name exists (created by the bot)
          const existing = await prisma.player.findFirst({
            where: { username: token.name },
          });

          if (existing && !existing.discordId) {
            // Link Discord to existing bot-created player
            player = await prisma.player.update({
              where: { id: existing.id },
              data: {
                discordId: account.providerAccountId,
                discordTag: token.name,
                avatarUrl: token.picture,
                email: token.email,
              },
            });
          } else {
            // Create new player
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
        } else {
          // Update avatar and name on each login
          await prisma.player.update({
            where: { id: player.id },
            data: { avatarUrl: token.picture, discordTag: token.name },
          });
        }

        token.id = String(player.id);
        token.isAdmin = player.isAdmin;
        token.discordId = account.providerAccountId;
      }

      return token;
    },
  },

  pages: {
    signIn: "/signin",
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
};
