
export function resource(initialValue, lazy) {
  let loading = $state(initialValue === undefined && !lazy);
  return { get loading() { return loading; } };
}
