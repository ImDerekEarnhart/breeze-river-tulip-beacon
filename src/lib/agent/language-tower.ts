/**
 * Lexical retrieval (BM25 + title/tag rerank).
 * This module is the retrieval subsystem. It is not the Language Tower,
 * not embeddings, not pgvector, and does not issue LANGUAGE_LIMIT certificates.
 */
import { CORPUS } from "./corpus";
import type { RetrievedDoc } from "./types";


const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "is",
  "it",
  "as",
  "be",
  "by",
  "with",
  "that",
  "this",
  "from",
  "are",
  "was",
  "at",
  "not",
  "into",
  "than",
  "then",
  "its",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/+.-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

const DOC_TOKENS = CORPUS.map((d) => tokenize(`${d.title} ${d.tags.join(" ")} ${d.text}`));
const DF = new Map<string, number>();
for (const tokens of DOC_TOKENS) {
  for (const t of new Set(tokens)) {
    DF.set(t, (DF.get(t) ?? 0) + 1);
  }
}

const N = CORPUS.length;
const K1 = 1.4;
const B = 0.75;
const AVG_LEN = DOC_TOKENS.reduce((s, t) => s + t.length, 0) / N;

function bm25(query: string[], docIndex: number): number {
  const tokens = DOC_TOKENS[docIndex] ?? [];
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const dl = tokens.length || 1;
  let score = 0;
  for (const q of query) {
    const f = tf.get(q) ?? 0;
    if (!f) continue;
    const df = DF.get(q) ?? 0.5;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    const denom = f + K1 * (1 - B + B * (dl / AVG_LEN));
    score += idf * ((f * (K1 + 1)) / denom);
  }
  return score;
}

function rerank(query: string, docs: RetrievedDoc[]): RetrievedDoc[] {
  const q = tokenize(query);
  return docs
    .map((d) => {
      const titleHits = tokenize(d.title).filter((t) => q.includes(t)).length;
      const tagHits = d.tags.filter((t) => q.includes(t.toLowerCase())).length;
      return {
        ...d,
        score: d.score + titleHits * 1.8 + tagHits * 1.1,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function retrieve(query: string, limit = 5): RetrievedDoc[] {
  const q = tokenize(query);
  if (q.length === 0) return [];
  const scored = CORPUS.map((doc, i) => ({
    id: doc.id,
    title: doc.title,
    text: doc.text,
    tags: doc.tags,
    score: bm25(q, i),
  }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  return rerank(query, scored).slice(0, limit);
}

export function retrieveById(id: string): RetrievedDoc | undefined {
  const doc = CORPUS.find((d) => d.id === id);
  if (!doc) return undefined;
  return { id: doc.id, title: doc.title, text: doc.text, tags: doc.tags, score: 1 };
}

export function corpusStats() {
  return {
    documents: CORPUS.length,
    tokens: DOC_TOKENS.reduce((s, t) => s + t.length, 0),
    tags: [...new Set(CORPUS.flatMap((d) => d.tags))].length,
  };
}
