export function make() {
  let n = $state(0);
  $effect(() => {
    /* keep ) going */
    n += 1;
  });
  return () => n;
}
