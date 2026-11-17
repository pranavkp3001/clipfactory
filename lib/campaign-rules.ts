export type RuleStatus = "PASS" | "REVIEW" | "FAIL";
export type CampaignRule = {
  id: string;
  label: string;
  kind: "duration" | "aspect_ratio" | "keyword" | "prohibited" | "hashtag" | "manual";
  value?: string | number;
  operator?: "min" | "max" | "contains" | "not_contains" | "equals";
  sourceText: string;
  confidence: "explicit" | "ambiguous";
};

export type RuleCheck = {
  ruleId: string;
  label: string;
  status: RuleStatus;
  reason: string;
};

// Conservative parser: it extracts only requirements stated in recognizable forms.
// Anything it cannot safely interpret is retained as a manual REVIEW item.
export function parseCampaignBrief(brief: string): CampaignRule[] {
  const rules: CampaignRule[] = [];
  const text = brief.trim();
  if (!text) return [{ id: "manual-brief", label: "Campaign brief supplied", kind: "manual", sourceText: "No brief supplied", confidence: "ambiguous" }];

  const duration = text.match(/(?:at least|min(?:imum)? of?)\s*(\d{1,3})\s*(?:seconds?|secs?|s)\b/i);
  const maxDuration = text.match(/(?:no more than|max(?:imum)? of?)\s*(\d{1,3})\s*(?:seconds?|secs?|s)\b/i);
  if (duration) rules.push({ id: "min-duration", label: "Minimum duration", kind: "duration", value: Number(duration[1]), operator: "min", sourceText: duration[0], confidence: "explicit" });
  if (maxDuration) rules.push({ id: "max-duration", label: "Maximum duration", kind: "duration", value: Number(maxDuration[1]), operator: "max", sourceText: maxDuration[0], confidence: "explicit" });

  const ratio = text.match(/\b(9\s*:\s*16|16\s*:\s*9|1\s*:\s*1)\b/i);
  if (ratio) rules.push({ id: "aspect-ratio", label: "Aspect ratio", kind: "aspect_ratio", value: ratio[1].replace(/\s/g, ""), operator: "equals", sourceText: ratio[0], confidence: "explicit" });

  const hashtags = [...text.matchAll(/#[a-z0-9_]+/gi)].map(m => m[0]);
  for (const tag of hashtags) rules.push({ id: "tag-" + tag.toLowerCase(), label: "Required hashtag " + tag, kind: "hashtag", value: tag, operator: "contains", sourceText: tag, confidence: "explicit" });

  const prohibited = text.match(/(?:do not|don't|must not|prohibited|avoid)\s+([^.!?\n]{3,100})/gi) ?? [];
  for (let i = 0; i < prohibited.length; i++) rules.push({ id: "prohibited-" + i, label: "Prohibited content to review", kind: "prohibited", value: prohibited[i], sourceText: prohibited[i], confidence: "explicit" });

  const known = rules.map(r => r.sourceText).join(" ");
  const residual = text.replace(known, " ").trim();
  if (residual || rules.length === 0) {
    rules.push({ id: "manual-review", label: "Other campaign requirements need manual interpretation", kind: "manual", sourceText: residual || text, confidence: "ambiguous" });
  }
  return rules;
}

export function evaluateClipRules(
  rules: CampaignRule[],
  clip: { durationSeconds?: number; aspectRatio?: string; title?: string; description?: string; transcript?: string; tags?: string[] }
): RuleCheck[] {
  const text = [clip.title, clip.description, clip.transcript, ...(clip.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
  return rules.map(rule => {
    if (rule.confidence === "ambiguous" || rule.kind === "manual" || rule.kind === "prohibited") {
      return { ruleId: rule.id, label: rule.label, status: "REVIEW", reason: "Requires a human check; this cannot be safely verified from available clip metadata." };
    }
    if (rule.kind === "duration") {
      if (typeof clip.durationSeconds !== "number") return { ruleId: rule.id, label: rule.label, status: "REVIEW", reason: "Clip duration is unavailable." };
      const pass = rule.operator === "min" ? clip.durationSeconds >= Number(rule.value) : clip.durationSeconds <= Number(rule.value);
      return { ruleId: rule.id, label: rule.label, status: pass ? "PASS" : "FAIL", reason: pass ? "Clip duration meets the explicit requirement." : "Clip duration does not meet the explicit requirement." };
    }
    if (rule.kind === "aspect_ratio") {
      if (!clip.aspectRatio) return { ruleId: rule.id, label: rule.label, status: "REVIEW", reason: "Aspect ratio metadata is unavailable." };
      const normalize = (s: string) => s.replace(/\s/g, "");
      const pass = normalize(clip.aspectRatio) === normalize(String(rule.value));
      return { ruleId: rule.id, label: rule.label, status: pass ? "PASS" : "FAIL", reason: pass ? "Aspect ratio matches." : "Aspect ratio does not match." };
    }
    if (rule.kind === "hashtag") {
      const pass = text.includes(String(rule.value).toLowerCase());
      return { ruleId: rule.id, label: rule.label, status: pass ? "PASS" : "FAIL", reason: pass ? "Required hashtag is present in available text." : "Required hashtag was not found in available text." };
    }
    return { ruleId: rule.id, label: rule.label, status: "REVIEW", reason: "No safe automatic check is available." };
  });
}
