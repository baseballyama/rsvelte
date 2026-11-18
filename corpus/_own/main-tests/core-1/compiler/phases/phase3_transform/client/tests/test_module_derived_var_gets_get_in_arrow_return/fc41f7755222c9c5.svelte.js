
export function useStore() {
  let x = $state(0);
  const y = $derived(x * 2);
  return {
    getValue: () => y,
  };
}
