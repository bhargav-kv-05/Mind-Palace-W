/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// MindPalace shared types
export type Role = "student" | "counsellor" | "volunteer" | "admin";

export interface Institution {
  id: string; // slug-like stable id
  name: string;
  region: string; // e.g. J&K, UT
  code: string; // institution access code
  domains?: string[]; // optional email domains for verification
}

export interface BaseAccount {
  id: string; // UUID-like string
  institutionCode: string;
  displayName: string;
}

export interface StudentAccount extends BaseAccount {
  role: "student";
  studentId: string; // provided by institution
  anonymousId: string; // system-assigned, traceable internally
}

export interface CounsellorAccount extends BaseAccount {
  role: "counsellor";
  counsellorId: string;
  verifiedBy: string; // hospital/institution code used for verification
}

export interface VolunteerAccount extends BaseAccount {
  role: "volunteer";
  volunteerId: string;
  nominatedBy: string; // counsellorId
}

export interface AdminAccount extends BaseAccount {
  role: "admin";
}

export type Account =
  | StudentAccount
  | CounsellorAccount
  | VolunteerAccount
  | AdminAccount;

export interface MockSeedPayload {
  institutions: Institution[];
  accounts: Account[];
}

export interface ScreeningPayload {
  institutionCode: string;
  studentId?: string;
  studentAnonymousId?: string;
  phq9: number[]; // 9 items, 0-3
  gad7: number[]; // 7 items, 0-3
}

export interface ScreeningScores {
  phq9Total: number;
  phq9Severity: "none" | "mild" | "moderate" | "moderately_severe" | "severe";
  gad7Total: number;
  gad7Severity: "none" | "mild" | "moderate" | "severe";
}

export interface ScreeningResult extends ScreeningScores {
  studentAnonymousId: string;
  counsellorAssignedId: string | null; // counsellorId receiving results
}

export interface CountBreakdown {
  _id: string;
  count: number;
}

export interface AdminAnalytics {
  screenings: {
    total: number;
    bySeverity: CountBreakdown[];
  };
  alerts: {
    bySeverity: CountBreakdown[];
    topTags: CountBreakdown[];
  };
  library: {
    byTone: CountBreakdown[];
  };
  posts: {
    total: number;
  };
  note?: string;
}
