import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/config/mongodb";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
		clientId: process.env.GOOGLE_CLIENT_ID!,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	adapter: MongoDBAdapter(clientPromise),
	session: { strategy: "database" },
	callbacks:{
		async session({ session, user }) {
			// Add user ID to session
			if (session?.user && user?.id) {
				session.user.id = user.id;
			}
			return session;
		},
		async signIn({ user, account, profile }) {
			console.log("User signed in:", user.id);
			
			// add custom user data here if needed
			// await customUserSetup(user.id);
			
			return true;
		},
	},
	// pages: {
	// 	signIn: "/auth/signin",
	// 	error: "/auth/error",
	// },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
