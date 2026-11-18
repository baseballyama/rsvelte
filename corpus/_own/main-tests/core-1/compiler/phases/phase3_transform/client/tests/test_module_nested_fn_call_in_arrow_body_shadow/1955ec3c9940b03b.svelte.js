
export function useStore() {
  let x = $state(0);
  const transform = (x) => Math.abs(Math.floor(x));
  return { get x() { return x; }, set x(v) { x = v; } };
}
