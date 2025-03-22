import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import {
  findUserByDiscordId,
  createOrUpdateUserFromAuth,
} from "../../../services/userService";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: { params: { scope: "identify email guilds" } },
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      // Add the user's Discord ID to the session
      if (user) {
        session.user.id = user.id;
        session.user.discordId = user.providerAccountId;

        // Fetch additional user data from our database
        const dbUser = await findUserByDiscordId(user.providerAccountId);
        if (dbUser) {
          session.user.farcasterLinked = !!dbUser.fid;
          session.user.walletLinked = !!dbUser.walletAddress;
          session.user.fid = dbUser.fid;
          session.user.username = dbUser.username;
        }
      }
      return session;
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
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
