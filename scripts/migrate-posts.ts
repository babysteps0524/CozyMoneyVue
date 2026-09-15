import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/data/posts");
const DRY_RUN = process.env.DRY_RUN === "true";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(.*?)\]\((https?:\/\/[^)]+)\)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function extractUrl(value: string): string {
  const decoded = decodeHtmlEntities(value);
  const markdown = decoded.match(/\]\((https?:\/\/[^)]+)\)/i);

  if (markdown) return markdown[1].trim();

  const plain = decoded.match(/https?:\/\/[^\s<>"')]+/i);

  return plain ? plain[0].replace(/[.,;:]+$/, "") : "";
}

function extractSourceTitle(value: string, url: string): string {
  const decoded = decodeHtmlEntities(value).trim();

  const markdown = decoded.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i);

  if (markdown) {
    return cleanText(markdown[1]);
  }

  const withoutUrl = decoded
    .replace(url, "")
    .replace(/\s*[-:：|]\s*$/, "")
    .trim();

  const bracket = withoutUrl.match(/^\[([^\]]+)\]\s*(.*)$/);

  if (bracket) {
    return cleanText(`${bracket[1]} ${bracket[2]}`);
  }

  return cleanText(withoutUrl) || "원문 출처";
}

function normalizeSource(source: any): { title: string; url: string } | null {
  const url = extractUrl(String(source?.url ?? ""));

  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) return null;

    const title =
      cleanText(source?.title) ||
      parsed.hostname.replace(/^www\./, "") ||
      "원문 출처";

    return { title, url: parsed.toString() };
  } catch {
    return null;
  }
}

function extractLegacySources(sections: any[]): {
  sections: any[];
  sources: { title: string; url: string }[];
} {
  const sources: { title: string; url: string }[] = [];
  const result: any[] = [];

  let inSourceSection = false;

  for (const section of sections) {
    const isHeading = section?.type === "heading";
    const headingText = cleanText(section?.content);

    if (isHeading && headingText === "출처") {
      inSourceSection = true;
      continue;
    }

    if (inSourceSection && isHeading) {
      inSourceSection = false;
    }

    if (inSourceSection) {
      if (section?.type === "list" || section?.type === "orderedList") {
        for (const item of section.items ?? []) {
          const text = String(item ?? "");
          const url = extractUrl(text);

          if (!url) continue;

          try {
            const parsed = new URL(url);

            if (!["http:", "https:"].includes(parsed.protocol)) continue;

            sources.push({
              title: extractSourceTitle(text, parsed.toString()),
              url: parsed.toString(),
            });
          } catch {
            // 잘못된 출처 URL은 제외
          }
        }
      } else if (section?.type === "paragraph") {
        const text = String(section.content ?? "");
        const url = extractUrl(text);

        if (url) {
          try {
            const parsed = new URL(url);

            if (["http:", "https:"].includes(parsed.protocol)) {
              sources.push({
                title: extractSourceTitle(text, parsed.toString()),
                url: parsed.toString(),
              });
            }
          } catch {
            // 무시
          }
        }
      }

      continue;
    }

    result.push(section);
  }

  return { sections: result, sources };
}

function dedupeSources(
  sources: any[],
): { title: string; url: string }[] {
  const map = new Map<string, { title: string; url: string }>();

  for (const source of sources) {
    const normalized = normalizeSource(source);

    if (!normalized) continue;

    if (!map.has(normalized.url)) {
      map.set(normalized.url, normalized);
    }
  }

  return [...map.values()];
}

function isH2(section: any): boolean {
  return (
    section?.type === "heading" &&
    Number(section.level) === 2 &&
    typeof section.content === "string"
  );
}

function normalizeSections(
  sections: any[],
  images: any[],
): any[] {
  const base: any[] = [];

  for (const section of sections) {
    if (!section || typeof section !== "object") continue;

    if (section.type === "image") continue;

    if (section.type === "heading") {
      const level = Number(section.level);

      // 게시글 제목은 post.title이 담당하므로 H1은 제거
      if (level < 2) continue;

      base.push({
        ...section,
        level: Math.min(4, Math.max(2, level)),
        content: cleanText(section.content),
      });

      continue;
    }

    if (section.type === "paragraph") {
      const content = cleanText(section.content);

      if (content) {
        base.push({ ...section, content });
      }

      continue;
    }

    if (section.type === "list" || section.type === "orderedList") {
      const items = Array.isArray(section.items)
        ? section.items.map(cleanText).filter(Boolean)
        : [];

      if (items.length) base.push({ ...section, items });

      continue;
    }

    if (
      section.type === "blockquote" ||
      section.type === "infoBox" ||
      section.type === "warningBox"
    ) {
      const content = cleanText(section.content);

      if (content) {
        base.push({
          ...section,
          content,
          ...(section.title
            ? { title: cleanText(section.title) }
            : {}),
        });
      }

      continue;
    }

    if (section.type === "table") {
      base.push({
        ...section,
        headers: Array.isArray(section.headers)
          ? section.headers.map(cleanText)
          : [],
        rows: Array.isArray(section.rows)
          ? section.rows.map((row: any[]) =>
              Array.isArray(row) ? row.map(cleanText) : [],
            )
          : [],
      });

      continue;
    }

    if (section.type === "chart") {
      base.push(section);
      continue;
    }

    // faq/source section은 최상위 필드에서 관리
  }

  const result: any[] = [];
  let h2Count = 0;
  let imageIndex = 0;
  const totalH2 = base.filter(
    (section) => section?.type === "heading" && Number(section.level) === 2,
  ).length;

  if (totalH2 < 4) {
    throw new Error(`H2가 4개 미만입니다: ${totalH2}`);
  }

  const imageTargets = new Set([2, totalH2 - 1]);

  /*
   * 이미지는 H2 바로 뒤가 아니라,
   * 해당 H2의 본문 블록이 끝난 뒤 다음 H2 직전에 배치한다.
   *
   * H2 본문 → 이미지 → 다음 H2 본문
   *
   * H2가 5개라면 2번째/4번째 H2 뒤에,
   * H2가 4개라면 2번째/3번째 H2 뒤에 배치한다.
   */
  for (let i = 0; i < base.length; i++) {
    const section = base[i];

    if (isH2(section)) {
      h2Count++;
    }

    result.push(section);

    if (imageTargets.has(h2Count) && isH2(section)) {
      let nextIndex = i + 1;

      while (nextIndex < base.length && !isH2(base[nextIndex])) {
        result.push(base[nextIndex]);
        nextIndex++;
      }

      if (imageIndex < 2) {
        result.push({
          type: "image",
          ...images[imageIndex],
        });

        imageIndex++;
      }

      i = nextIndex - 1;
    }
  }

  if (imageIndex !== 2) {
    throw new Error(`이미지 배치 실패: ${imageIndex}/2`);
  }

  return result;
}

function migrateFile(filePath: string): boolean {
  const original = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const legacy = extractLegacySources(
    Array.isArray(original.sections) ? original.sections : [],
  );

  const sources = dedupeSources([
    ...(Array.isArray(original.sources) ? original.sources : []),
    ...legacy.sources,
  ]);

  if (sources.length === 0) {
    console.warn(`[WARN] 출처 없음: ${filePath}`);
  }

  const images = Array.isArray(original.images) ? original.images : [];

  if (images.length !== 2) {
    throw new Error(`${filePath}: images가 2개가 아닙니다.`);
  }

  const sections = normalizeSections(
    legacy.sections,
    images,
  );

  const next = {
    ...original,
    sections,
    sources,
    updated: original.updated || original.date,
  };

  delete next.id;
  delete next.slug;

  /*
   * 파일 구조 자체는 기존 필드를 유지하되,
   * id/slug는 아래에서 원본 파일명 기준으로 복원한다.
   */
  const category = path.basename(path.dirname(filePath));
  const slug = path.basename(filePath, ".json");

  next.id = `${category}-${slug}`;
  next.slug = slug;

  const output = JSON.stringify(next, null, 2) + "\n";
  const current = fs.readFileSync(filePath, "utf8");

  if (output === current) return false;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, output, "utf8");
  }

  return true;
}

const files: string[] = [];

for (const category of ["stock", "tax", "accounting"]) {
  const directory = path.join(ROOT, category);

  if (!fs.existsSync(directory)) continue;

  for (const file of fs.readdirSync(directory)) {
    if (file.endsWith(".json")) {
      files.push(path.join(directory, file));
    }
  }
}

let changed = 0;

for (const file of files) {
  if (migrateFile(file)) {
    changed++;
    console.log(`${DRY_RUN ? "[DRY RUN] " : ""}수정: ${file}`);
  }
}

console.log(`\n게시글 ${files.length}개 검사, ${changed}개 수정`);
