import { MockSeedPayload, Institution, Account } from "./api";

const institutions: Institution[] = [
  {
    id: "univ-kashmir",
    name: "University of Kashmir",
    region: "Jammu & Kashmir",
    code: "JKU-UK-001",
    domains: ["kashmiruniversity.net"],
  },
  {
    id: "univ-jammu",
    name: "University of Jammu",
    region: "Jammu & Kashmir",
    code: "JKU-UJ-002",
    domains: ["jammuuniversity.ac.in"],
  },
  {
    id: "nit-srinagar",
    name: "NIT Srinagar",
    region: "Jammu & Kashmir",
    code: "JKU-NITS-003",
    domains: ["nitsri.ac.in"],
  },
  {
    id: "skims",
    name: "Sher-i-Kashmir Institute of Medical Sciences",
    region: "Jammu & Kashmir",
    code: "JKH-SKIMS-004",
    domains: ["skims.ac.in"],
  },
  {
    id: "iust",
    name: "Islamic University of Science & Technology",
    region: "Jammu & Kashmir",
    code: "JKU-IUST-005",
    domains: ["iust.ac.in"],
  },
  {
    id: "cuk",
    name: "Central University of Kashmir",
    region: "Jammu & Kashmir",
    code: "JKU-CUK-006",
    domains: ["cukashmir.ac.in"],
  },
];

const accounts: Account[] = [
  // Admins (one per institution for prototype)
  { id: "adm-uk-1", institutionCode: "JKU-UK-001", displayName: "Admin • UoK", role: "admin" },
  { id: "adm-uj-1", institutionCode: "JKU-UJ-002", displayName: "Admin • UoJ", role: "admin" },

  // Counsellors (verified with institution/hospital code)
  { id: "csl-uk-psy1", institutionCode: "JKU-UK-001", displayName: "Dr. A. Mir", role: "counsellor", counsellorId: "UK-PSY-01", verifiedBy: "JKH-SKIMS-004" },
  { id: "csl-uj-psy1", institutionCode: "JKU-UJ-002", displayName: "Dr. R. Sharma", role: "counsellor", counsellorId: "UJ-PSY-01", verifiedBy: "JKU-UJ-002" },
  { id: "csl-nit-psy1", institutionCode: "JKU-NITS-003", displayName: "Dr. S. Qadri", role: "counsellor", counsellorId: "NITS-PSY-01", verifiedBy: "JKH-SKIMS-004" },

  // Volunteers (nominated by counsellors)
  { id: "vol-uk-1", institutionCode: "JKU-UK-001", displayName: "Peer Mentor • Hiba", role: "volunteer", volunteerId: "UK-VOL-01", nominatedBy: "UK-PSY-01" },
  { id: "vol-uj-1", institutionCode: "JKU-UJ-002", displayName: "Peer Mentor • Aman", role: "volunteer", volunteerId: "UJ-VOL-01", nominatedBy: "UJ-PSY-01" },

  // Students (with anonymous IDs)
  { id: "stu-uk-21", institutionCode: "JKU-UK-001", displayName: "Student • UoK #21", role: "student", studentId: "UK-21-4587", anonymousId: "anon-uk-7f9c" },
  { id: "stu-uk-22", institutionCode: "JKU-UK-001", displayName: "Student • UoK #22", role: "student", studentId: "UK-22-1934", anonymousId: "anon-uk-b2d1" },
  { id: "stu-uj-13", institutionCode: "JKU-UJ-002", displayName: "Student • UoJ #13", role: "student", studentId: "UJ-13-7751", anonymousId: "anon-uj-3a6e" },
  { id: "stu-nit-05", institutionCode: "JKU-NITS-003", displayName: "Student • NITS #05", role: "student", studentId: "NITS-05-2210", anonymousId: "anon-nits-91af" },
];

export const mockSeed: MockSeedPayload = { institutions, accounts };
export default mockSeed;
