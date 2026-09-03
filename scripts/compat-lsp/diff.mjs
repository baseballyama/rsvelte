import { createHash } from "node:crypto";

const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);
const pointerPart = (value) =>
  String(value).replaceAll("~", "~0").replaceAll("/", "~1");

// Exported so a classifier can resolve a `@`-segment back to the item it names
// without a second copy of this digest.
export function identity(method, pointer, value) {
  if (value === null || typeof value !== "object") {
    const readable = pointerPart(String(value))
      .replace(/[^\w.~+-]/g, "_")
      .slice(0, 32);
    return `value-${readable}-${digest(value)}`;
  }
  if (method === "textDocument/completion" && pointer.endsWith("/items")) {
    return `completion-${digest([value.label, value.kind, value.sortText, value.filterText])}`;
  }
  if (method === "textDocument/diagnostic" && pointer.endsWith("/items")) {
    return `diagnostic-${digest([value.code, value.source, value.range?.start])}`;
  }
  if (method === "textDocument/definition" || (value.uri && value.range)) {
    return `location-${digest([value.uri, value.range?.start, value.targetUri, value.targetRange?.start])}`;
  }
  if (method === "textDocument/foldingRange") {
    return `fold-${digest([value.startLine, value.startCharacter, value.endLine, value.endCharacter, value.kind])}`;
  }
  if (method === "textDocument/inlayHint") {
    return `hint-${digest([value.position, value.kind, value.label])}`;
  }
  return `item-${digest(value)}`;
}

function walk(method, left, right, pointer, differences) {
  if (Object.is(left, right)) return;
  if (Array.isArray(left) && Array.isArray(right)) {
    const leftBuckets = new Map();
    const rightBuckets = new Map();
    for (const value of left) {
      const key = identity(method, pointer, value);
      leftBuckets.set(key, [...(leftBuckets.get(key) ?? []), value]);
    }
    for (const value of right) {
      const key = identity(method, pointer, value);
      rightBuckets.set(key, [...(rightBuckets.get(key) ?? []), value]);
    }
    const missingRsvelte = [];
    const extraRsvelte = [];
    for (const key of new Set([
      ...leftBuckets.keys(),
      ...rightBuckets.keys(),
    ])) {
      const leftValues = leftBuckets.get(key) ?? [];
      const rightValues = rightBuckets.get(key) ?? [];
      const common = Math.min(leftValues.length, rightValues.length);
      for (let index = 0; index < common; index++) {
        walk(
          method,
          leftValues[index],
          rightValues[index],
          `${pointer}/@${pointerPart(key)}`,
          differences,
        );
      }
      for (let index = common; index < leftValues.length; index++)
        missingRsvelte.push(key);
      for (let index = common; index < rightValues.length; index++)
        extraRsvelte.push(key);
    }
    // `-element` and `-field` name the two mechanisms an unqualified
    // `extra-rsvelte` collapsed: an array that carries one more entry, and an
    // object the other side has no such key on. `verify.mjs` strips the suffix
    // from the ratchet key and keeps the bracket, so `count=` is the only thing
    // left saying which branch wrote the hash — and this branch's is a digest of
    // identity keys, which does not preimage back to a value.
    if (missingRsvelte.length) {
      differences.push(
        `${pointer}:missing-rsvelte-element[count=${missingRsvelte.length},hash=${digest(missingRsvelte.sort())}]`,
      );
    }
    if (extraRsvelte.length) {
      differences.push(
        `${pointer}:extra-rsvelte-element[count=${extraRsvelte.length},hash=${digest(extraRsvelte.sort())}]`,
      );
    }
    return;
  }
  if (
    left &&
    right &&
    typeof left === "object" &&
    typeof right === "object" &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const child = `${pointer}/${pointerPart(key)}`;
      if (!(key in left))
        differences.push(`${child}:extra-rsvelte-field[hash=${digest(right[key])}]`);
      else if (!(key in right))
        differences.push(`${child}:missing-rsvelte-field[hash=${digest(left[key])}]`);
      else walk(method, left[key], right[key], child, differences);
    }
    return;
  }
  differences.push(
    `${pointer || "/"}:value-mismatch[official=${digest(left)},rsvelte=${digest(right)}]`,
  );
}

export function diffJson(method, official, rsvelte) {
  const differences = [];
  walk(method, official, rsvelte, "", differences);
  return differences.sort();
}
