let a = $state(1),
  b = $state(2),
  plain = 3;

const c = $derived(a + b),
  d = $derived.by(() => a * b),
  constant = 4;

export function read() {
  return `${a}${b}${plain}${c}${d}${constant}`;
}
