
export function useStore() {
  let cleanup = $state();
  $effect(() => { cleanup?.(); });
  return {
    setCleanup: (fn) => { cleanup = fn; },
  };
}
