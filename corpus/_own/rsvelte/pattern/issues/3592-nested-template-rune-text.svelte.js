const nested = `a ${`$state(0)`} b`;
const deeper = `a ${`b ${`c ${`$derived(0)`} d`} e`} f`;

export function makeCounter(step) {
  let n = $state(0);
  const doubled = $derived(n * 2);

  return {
    get label() {
      return nested + deeper;
    },
    get doubled() {
      return doubled;
    },
    bump() {
      n += step;
    },
  };
}
