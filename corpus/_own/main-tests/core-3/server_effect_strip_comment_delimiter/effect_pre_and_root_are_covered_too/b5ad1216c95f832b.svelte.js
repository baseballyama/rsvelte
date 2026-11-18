export function make() {
  let n = $state(0);
  $effect.root(() => {
    // ) c
    n += 1;
  });
  return () => n;
}
