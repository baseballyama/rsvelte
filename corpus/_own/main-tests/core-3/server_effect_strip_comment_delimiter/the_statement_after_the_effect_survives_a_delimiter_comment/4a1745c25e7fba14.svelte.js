export function make() {
  let n = $state(0);
  $effect(() => {
    // ) c
    n += 1;
  });
  const after = 7;
  return () => n + after;
}
