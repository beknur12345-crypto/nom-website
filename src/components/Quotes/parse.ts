export type Segment = { text: string; redacted: boolean };

/** Splits "a [b] c" into plain and redacted segments. */
export function parseRedacted(text: string): Segment[] {
  return text
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('[') && part.endsWith(']')
        ? { text: part.slice(1, -1), redacted: true }
        : { text: part, redacted: false },
    );
}
