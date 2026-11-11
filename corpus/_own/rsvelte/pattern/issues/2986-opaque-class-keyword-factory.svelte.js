// a factory, so we avoid class here
export function makeToggle(a, b) {
  const differs = $derived(a !== b);

  return {
    get differs() {
      return differs;
    },
  };
}
