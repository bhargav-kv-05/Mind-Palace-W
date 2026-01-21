export const SENSITIVE_KEYWORDS = [
    "suicide",
    "suicidal",
    "kill myself",
    "killing myself",
    "kill me",
    "want to die",
    "end my life",
    "hurt myself",
    "cutting myself",
    "overdose",
    "hang myself",
    "gun",
    "shoot",
    "murder",
    "rape",
    "abuse",
    "depression", // Context dependent, but good for testing
    "anxiety"     // Context dependent
];

export function detectSensitiveContent(text: string): { flagged: boolean; keyword?: string; severity: "low" | "moderate" | "severe" } {
    const lower = text.toLowerCase();

    for (const word of SENSITIVE_KEYWORDS) {
        if (lower.includes(word)) {
            // Basic severity logic: immediate threats are severe
            let severity: "low" | "moderate" | "severe" = "moderate";
            if (word === "suicide" || word === "suicidal" || word.includes("kill") || word.includes("die") || word.includes("end my life")) {
                severity = "severe";
            }
            return { flagged: true, keyword: word, severity };
        }
    }

    return { flagged: false, severity: "low" }; // Default
}
