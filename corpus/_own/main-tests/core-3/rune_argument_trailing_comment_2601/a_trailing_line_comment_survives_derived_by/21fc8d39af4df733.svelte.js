export function make() {
  let n = $state(1);
  let d = $derived.by(
    () => n + 1
// c
  );
  return () => d;
}
