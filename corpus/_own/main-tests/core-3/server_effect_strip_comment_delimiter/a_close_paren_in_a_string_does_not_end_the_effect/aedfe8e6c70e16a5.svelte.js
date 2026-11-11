export function make() {
  let n = $state(0);
  $effect(() => {
    log(")");
    n += 1;
  });
  return () => n;
}
