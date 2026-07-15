import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { verifyAdminCredentials } = await import("./admins");
        // Already validated against the "admins" collection - if this
        // returns null, NextAuth rejects the sign-in.
        return verifyAdminCredentials(
          String(credentials.email),
          String(credentials.password)
        );
      },
    }),
  ],

  pages: {
    signIn: "/admin/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    // Runs for EVERY provider, including GitHub.
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "github") {
        const { findAdminByEmail, countAdmins, createAdminEmailOnly } =
          await import("./admins");
        const existing = await findAdminByEmail(user.email);
        if (existing) return true;

        // Bootstrap: nobody has ever signed in - the first person through
        // the door (GitHub or the register form) becomes the first admin.
        const total = await countAdmins();
        if (total === 0) {
          await createAdminEmailOnly(user.email, user.name ?? undefined);
          return true;
        }

        return false; // not an existing user, and registration is closed
      }

      // Credentials provider already checked the "admins" collection in
      // authorize() above - if we got a user object back, it's legitimate.
      return true;
    },
  },
});
