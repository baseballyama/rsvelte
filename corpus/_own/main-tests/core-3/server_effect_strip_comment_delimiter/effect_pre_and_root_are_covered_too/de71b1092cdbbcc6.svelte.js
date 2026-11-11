export function make() {
  let n = $state(0);
  $effect.pre(() => {
    // ) c
    n += 1;
  });
  return () => n;
}
