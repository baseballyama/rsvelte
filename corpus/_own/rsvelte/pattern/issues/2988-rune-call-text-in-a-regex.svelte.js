const derivedPattern = /$derived(x)/;
const statePattern = /$state(x)/;

export function match(input) {
  return derivedPattern.test(input) || statePattern.test(input);
}
