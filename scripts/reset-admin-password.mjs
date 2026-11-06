/**
 * Reset (or create) an admin account in the cosengphotography database.
 *
 * No email address or password is stored in this file. You are asked for them
 * when you run it, and the password you type is not shown or printed.
 *
 *   node --env-file=.env.local scripts/reset-admin-password.mjs
 *
 * Optional: set ADMIN_EMAIL in the environment to skip the email question.
 */

import readline from "node:readline";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/reset-admin-password.mjs");
}

const MIN_PASSWORD_LENGTH = 12;

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = function (str) {
      if (hidden && this.stdoutMuted) return; // do not echo what is typed
      this.output.write(str);
    };
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
    if (hidden) rl.stdoutMuted = true;
  });
}

async function run() {
  const email = (process.env.ADMIN_EMAIL || (await ask("Admin email: "))).trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Enter a valid email address.");

  const password = await ask(`New password (at least ${MIN_PASSWORD_LENGTH} characters): `, { hidden: true });
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const confirm = await ask("Type it again: ", { hidden: true });
  if (confirm !== password) throw new Error("The two passwords did not match. Nothing was changed.");

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const col = client.db("cosengphotography").collection("admins");
    const passwordHash = await bcrypt.hash(password, 12);

    const existing = await col.findOne({ email });
    if (existing) {
      await col.updateOne({ email }, { $set: { passwordHash, updatedAt: new Date() } });
      console.log(`Password updated for ${email}.`);
    } else {
      const name = (await ask("Name for the new account: ")).trim() || email;
      await col.insertOne({ name, email, passwordHash, role: "admin", createdAt: new Date() });
      console.log(`Admin account created for ${email}.`);
    }
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exitCode = 1;
});
