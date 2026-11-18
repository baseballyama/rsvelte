export const useFoo = () => {
  let n = $state(0);
  const doubled = $derived(n * 2);
  return doubled;
};
