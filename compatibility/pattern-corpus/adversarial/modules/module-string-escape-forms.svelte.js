export const strings = [
  "\n\t\r\v\b\f",
  "\\",
  '"',
  "'",
  "\u0041",
  "\u{1F600}",
  "\x41",
  "\0",
  "a\
b",
];

export const templates = [`\``, `\${'}'}`, `\\`];

let count = $state(0);

export function total() {
  count = strings.length + templates.length;
  return count;
}
