import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import {
  findUserByDiscordId,
  createOrUpdateUserFromAuth,
} from "../../../services/userService";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_DISCORD_CLIENT_SECRET as string,

      authorization: { params: { scope: "identify email guilds" } },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      // Add the user's Discord ID to the session
      if (token) {
        session.user.id = token.sub;
        session.user.discordId = token.discordId;

        // Fetch additional user data from our database
        const dbUser = await findUserByDiscordId(token.discordId);
        if (dbUser) {
          session.user.farcasterLinked = !!dbUser.fid;
          session.user.walletLinked = !!dbUser.walletAddress;
          session.user.fid = dbUser.fid;
          session.user.username = dbUser.username;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }: any) {
      // Store the Discord ID in the token
      if (account && account.provider === "discord") {
        token.discordId = profile.id;
      }
      return token;
    },
    async signIn({ user, account, profile }: any) {
      if (account.provider === "discord") {
        try {
          // Store or update the user in our database
          await createOrUpdateUserFromAuth({
            discordId: profile.id,
            email: profile.email,
            displayName: profile.username,
            avatar: profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : undefined,
          });
          return true;
        } catch (error) {
          console.error("Error saving user from Discord:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
