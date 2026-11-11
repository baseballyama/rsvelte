let a = $state(1);
let b = $state.raw({ list: [] });

const c = $derived(a * 2);
const d = $derived.by(() => c + b.list.length);

export function read() {
  return [a, b, c, d];
}

export function write(next) {
  a = next;
  b = { list: [...b.list, next] };
}
