import { loadDocuments } from "@/lib/knowledge/load";

const ALIASES: Record<string, string> = {
  hb: "Huntington Beach",
  rsm: "Rancho Santa Margarita",
  mv: "Mission Viejo",
};

export function listServiceCities(): string[] {
  const doc = loadDocuments().find((item) => item.source === "service-area.md");
  if (!doc) return [];
  const cities: string[] = [];
  let inList = false;
  for (const line of doc.text.split("\n")) {
    if (line.startsWith("## ")) {
      inList = line.toLowerCase().includes("cities we serve");
      continue;
    }
    if (!inList) continue;
    if (line.startsWith("## ") || (line.startsWith("#") && !line.startsWith("## "))) {
      break;
    }
    if (line.startsWith("- ")) {
      cities.push(line.slice(2).trim());
    }
  }
  return cities;
}

export function matchCity(input: string, cities = listServiceCities()): string | null {
  const cleaned = input
    .toLowerCase()
    .replace(/[.]/g, " ")
    .replace(/\borange county\b/g, " ")
    .replace(/\bcalifornia\b/g, " ")
    .replace(/\bca\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sorted = [...cities].sort((a, b) => b.length - a.length);
  for (const city of sorted) {
    const needle = city.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${needle}\\b`, "i").test(cleaned)) return city;
  }

  for (const token of cleaned.split(" ")) {
    const alias = ALIASES[token];
    if (alias && cities.includes(alias)) return alias;
  }
  return null;
}
