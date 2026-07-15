// Optional/backup way to create an admin account from the command line -
// the normal path is /admin/register (first run) or /admin/users (adding
// teammates once you're signed in). Useful for CI, resets, or if you're
// locked out.
// Usage: node scripts/create-admin.mjs you@example.com yourPassword
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "headless_cms";

if (!uri) {
  console.error("Missing MONGODB_URI - check your .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db(dbName);
  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection("admins").updateOne(
    { email: email.toLowerCase() },
    { $set: { email: email.toLowerCase(), passwordHash, updatedAt: new Date() } },
    { upsert: true }
  );

  console.log(`Admin account ready for ${email}`);
  console.log(`Don't forget to add it to ALLOWED_ADMIN_EMAILS in .env.local`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
