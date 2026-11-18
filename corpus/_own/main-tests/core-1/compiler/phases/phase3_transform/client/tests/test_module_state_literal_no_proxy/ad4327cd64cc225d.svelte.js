
export function useStore() {
  let count = $state(0);
  let name = $state('hello');
  return {
    get count() { return count; },
    set count(v) { count = v; },
    get name() { return name; },
    set name(v) { name = v; },
  };
}
