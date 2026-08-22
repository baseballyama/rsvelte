export const patterns = [/\$state\(/g, /[{}]/, /\/\*/, /a\/b/u];

export const strings = [
  "$derived(",
  "class Fake {",
  "export let x = 1",
  "// not a comment",
  "/* not a comment */",
];

let hits = $state(0);

export function scan(text) {
  for (const p of patterns) if (p.test(text)) hits += 1;
  return hits;
}
