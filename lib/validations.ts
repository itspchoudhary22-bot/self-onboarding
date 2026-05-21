interface PincodeRule {
  pattern: RegExp;
  hint: string;
}

const PINCODE_RULES: Record<string, PincodeRule> = {
  "India":                { pattern: /^\d{6}$/,                  hint: "6-digit PIN code (e.g. 110001)" },
  "United States":        { pattern: /^\d{5}(-\d{4})?$/,         hint: "5-digit ZIP code (e.g. 10001)" },
  "United Kingdom":       { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, hint: "Postcode format: SW1A 1AA" },
  "Canada":               { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, hint: "Postal code format: A1A 1A1" },
  "Australia":            { pattern: /^\d{4}$/,                  hint: "4-digit postcode (e.g. 2000)" },
  "Germany":              { pattern: /^\d{5}$/,                  hint: "5-digit PLZ (e.g. 10115)" },
  "France":               { pattern: /^\d{5}$/,                  hint: "5-digit postal code (e.g. 75001)" },
  "China":                { pattern: /^\d{6}$/,                  hint: "6-digit postal code" },
  "Japan":                { pattern: /^\d{3}-?\d{4}$/,           hint: "Postal code format: 123-4567" },
  "Brazil":               { pattern: /^\d{5}-?\d{3}$/,           hint: "CEP format: 12345-678" },
  "Singapore":            { pattern: /^\d{6}$/,                  hint: "6-digit postal code" },
  "Pakistan":             { pattern: /^\d{5}$/,                  hint: "5-digit postcode" },
  "Bangladesh":           { pattern: /^\d{4}$/,                  hint: "4-digit postcode" },
  "Sri Lanka":            { pattern: /^\d{5}$/,                  hint: "5-digit postal code" },
  "Nepal":                { pattern: /^\d{5}$/,                  hint: "5-digit postal code" },
  "United Arab Emirates": { pattern: /^\d{5}$/,                  hint: "5-digit postcode" },
  "Saudi Arabia":         { pattern: /^\d{5}$/,                  hint: "5-digit postal code" },
  "South Africa":         { pattern: /^\d{4}$/,                  hint: "4-digit postal code" },
  "Mexico":               { pattern: /^\d{5}$/,                  hint: "5-digit CP (código postal)" },
  "Nigeria":              { pattern: /^\d{6}$/,                  hint: "6-digit postcode" },
  "Indonesia":            { pattern: /^\d{5}$/,                  hint: "5-digit postcode" },
  "Malaysia":             { pattern: /^\d{5}$/,                  hint: "5-digit postcode" },
  "Thailand":             { pattern: /^\d{5}$/,                  hint: "5-digit postcode" },
  "Philippines":          { pattern: /^\d{4}$/,                  hint: "4-digit ZIP code" },
};

export function getPincodeHint(country: string): string {
  return PINCODE_RULES[country]?.hint ?? "Postcode / ZIP code";
}

export function validatePincode(pincode: string, country: string): string | undefined {
  const v = pincode.trim();
  if (!v) return "Pincode / ZIP is required.";
  const rule = PINCODE_RULES[country];
  if (rule && !rule.pattern.test(v)) return `Invalid format — expected ${rule.hint}.`;
  if (!rule && v.length < 3) return "Please enter a valid postcode.";
  return undefined;
}

export function validateSocialMedia(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "At least one social media handle or website is required.";

  const hasUrl = /https?:\/\/\S+/.test(v);
  const hasHandle = /@\w+/.test(v);
  if (!hasUrl && !hasHandle) {
    return "Please include at least one URL (https://…) or @handle.";
  }

  const urls = v.match(/https?:\/\/\S+/g) ?? [];
  for (const url of urls) {
    try { new URL(url); } catch {
      return `"${url}" doesn't look like a valid URL.`;
    }
  }

  return undefined;
}
