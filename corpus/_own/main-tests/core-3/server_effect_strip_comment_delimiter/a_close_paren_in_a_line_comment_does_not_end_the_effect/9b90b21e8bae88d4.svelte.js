export function make() {
  let n = $state(0);
  $effect(() => {
    // ) c
    n += 1;
  });
  return () => n;
}
