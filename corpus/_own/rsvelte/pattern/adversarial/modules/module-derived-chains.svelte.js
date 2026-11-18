let base = $state(1);
const once = $derived(base * 2);
const twice = $derived(once + base);
const byFn = $derived.by(() => {
  let total = 0;
  for (const n of [once, twice]) total += n;
  return total;
});

export function bump() {
  base += 1;
}

export const view = {
  get base() {
    return base;
  },
  get once() {
    return once;
  },
  get twice() {
    return twice;
  },
  get byFn() {
    return byFn;
  },
};
