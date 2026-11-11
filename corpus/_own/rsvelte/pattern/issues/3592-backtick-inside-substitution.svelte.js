const quoted = `a ${'`'} $state(0) b`;
const commented = `a ${/* ` */ 1} $derived(0) b`;
const regexed = `a ${/`/.source} $state(0) b`;

export function makeCounter(step) {
  let n = $state(0);
  const doubled = $derived(n * 2);

  return {
    get label() {
      return quoted + commented + regexed;
    },
    get doubled() {
      return doubled;
    },
    bump() {
      n += step;
    },
  };
}
