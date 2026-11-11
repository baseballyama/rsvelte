export function make() {
  let n = $state(0);
  $effect(() => {
    // plain
    n += 1;
  });
  return () => n;
}
