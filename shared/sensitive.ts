export type KeywordTag = "self_harm" | "suicide" | "violence" | "abuse" | "bullying" | "harassment" | "sexual_violence" | "extremism" | "drugs" | "panic" | "anxiety" | "depression" | "lonely" | "stress" | "exam";

export interface SensitiveLexiconEntry {
  tag: KeywordTag;
  weight: number; // higher => more severe
  terms: string[]; // include regional/language variants if known
}

export const sensitiveLexicon: SensitiveLexiconEntry[] = [
  { tag: "suicide", weight: 10, terms: ["suicide", "end my life", "kill myself", "self harm", "self-harm", "hang myself", "die", "i want to die"] },
  { tag: "self_harm", weight: 9, terms: ["cutting", "cut myself", "hurt myself", "bleeding on purpose"] },
  { tag: "violence", weight: 8, terms: ["violence", "attack", "hurt someone", "fight", "assault"] },
  { tag: "abuse", weight: 8, terms: ["abuse", "domestic violence", "beaten", "harassed", "molested"] },
  { tag: "sexual_violence", weight: 9, terms: ["rape", "sexual assault", "forced", "coerced"] },
  { tag: "bullying", weight: 6, terms: ["bully", "ragging", "tease", "humiliate"] },
  { tag: "harassment", weight: 6, terms: ["harass", "stalk", "threaten"] },
  { tag: "extremism", weight: 8, terms: ["extremist", "radicalize", "terror", "bomb"] },
  { tag: "drugs", weight: 5, terms: ["overdose", "opioids", "heroin", "cocaine", "mdma"] },
  { tag: "panic", weight: 5, terms: ["panic", "panic attack", "breathless", "heart racing"] },
  { tag: "anxiety", weight: 4, terms: ["anxious", "anxiety", "worry", "nervous"] },
  { tag: "depression", weight: 5, terms: ["depressed", "depression", "cant get up", "empty"] },
  { tag: "lonely", weight: 3, terms: ["lonely", "alone", "isolated"] },
  { tag: "stress", weight: 3, terms: ["stress", "stressed", "pressure"] },
  { tag: "exam", weight: 2, terms: ["exam", "exams", "test", "results"] },
];

export const escalation = {
  severeThreshold: 9, // immediate alert to counsellor/volunteer
  moderateThreshold: 5, // show motivational insights + consider alert
};

export function analyzeText(input: string) {
  const text = ` ${input.toLowerCase()} `;
  const matches: { tag: KeywordTag; weight: number; term: string }[] = [];
  for (const entry of sensitiveLexicon) {
    for (const term of entry.terms) {
      if (text.includes(` ${term.toLowerCase()} `) || text.includes(`${term.toLowerCase()}`)) {
        matches.push({ tag: entry.tag, weight: entry.weight, term });
      }
    }
  }
  const score = matches.reduce((s, m) => Math.max(s, m.weight), 0);
  return { matches, score };
}
