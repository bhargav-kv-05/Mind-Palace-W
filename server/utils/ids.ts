import crypto from "node:crypto";

function base36(n: number) {
  return n.toString(36).slice(-6).padStart(6, "0");
}

function checksum(input: string) {
  const hash = crypto.createHash("sha1").update(input).digest("hex");
  return hash.slice(0, 4);
}

export function generateAnonymousId(institutionCode: string) {
  const inst = institutionCode.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const rand = crypto.randomBytes(4).readUInt32BE(0);
  const token = base36(rand);
  const raw = `${inst}:${token}`;
  const cs = checksum(raw);
  return `anon-${inst}-${token}-${cs}`;
}
