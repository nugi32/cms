import { ObjectId, type Filter } from "mongodb";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  hasPassword: boolean;
  createdAt?: Date;
}

async function admins() {
  const db = await getDb();
  return db.collection("admins");
}

async function adminSetupState() {
  const db = await getDb();
  return db.collection("admin_setup");
}

const FIRST_ADMIN_SETUP_ID = new ObjectId("000000000000000000000000");

export async function claimFirstAdminSetup(): Promise<boolean> {
  const collection = await adminSetupState();
  const result = await collection.updateOne(
    { _id: FIRST_ADMIN_SETUP_ID } as Filter<unknown>,
    { $setOnInsert: { status: "in-progress", createdAt: new Date() } },
    { upsert: true }
  );
  return result.upsertedCount === 1;
}

export async function releaseFirstAdminSetup() {
  const collection = await adminSetupState();
  await collection.deleteOne({ _id: FIRST_ADMIN_SETUP_ID } as Filter<unknown>);
}

/** How many admin accounts exist - 0 means the app hasn't been set up yet. */
export async function countAdmins(): Promise<number> {
  return (await admins()).countDocuments();
}

export async function findAdminByEmail(email: string) {
  return (await admins()).findOne({ email: email.toLowerCase() });
}

/** Used by the Credentials provider. Returns null on any mismatch. */
export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await findAdminByEmail(email);
  if (!admin || !admin.passwordHash) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  return {
    id: admin._id.toString(),
    email: admin.email as string,
    name: (admin.name as string) || (admin.email as string),
  };
}

/** Creates an admin who can sign in with email + password (and GitHub, if the emails match). */
export async function createAdminWithPassword(
  email: string,
  password: string,
  name?: string
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = {
    email: email.toLowerCase(),
    passwordHash,
    name: name || email,
    createdAt: new Date(),
  };
  const res = await (await admins()).insertOne(doc);
  return { id: res.insertedId.toString(), ...doc };
}

/** Creates an admin who can only sign in via GitHub OAuth with a matching email. */
export async function createAdminEmailOnly(email: string, name?: string) {
  const doc = {
    email: email.toLowerCase(),
    name: name || email,
    createdAt: new Date(),
  };
  const res = await (await admins()).insertOne(doc);
  return { id: res.insertedId.toString(), ...doc };
}

export async function listAdmins(): Promise<AdminUser[]> {
  const docs = await (await admins()).find({}).sort({ createdAt: 1 }).toArray();
  return docs.map((d) => ({
    id: d._id.toString(),
    email: d.email,
    name: d.name,
    hasPassword: !!d.passwordHash,
    createdAt: d.createdAt,
  }));
}

export async function deleteAdmin(id: string) {
  await (await admins()).deleteOne({ _id: new ObjectId(id) });
}
