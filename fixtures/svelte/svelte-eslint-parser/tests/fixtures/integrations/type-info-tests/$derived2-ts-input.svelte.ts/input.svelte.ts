export type Info = { n: number };
export function foo() {
  let a: Info | null = $state(null);
  a = null; // *
  const d = $derived(a?.n ? fn(a.n) : null);
  return {
    get d() {
      return d;
    },
    set(b: Info | null) {
      a = b;
    },
  };

  function fn(n: number) {
    return n * 2;
  }
}
