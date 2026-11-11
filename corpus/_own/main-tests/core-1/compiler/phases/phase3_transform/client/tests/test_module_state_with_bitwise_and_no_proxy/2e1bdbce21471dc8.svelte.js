
export function useFlags(a, b) {
  let flags = $state(a & b);
  return { get flags() { return flags; } };
}
