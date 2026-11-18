
export const defaultSerializer = () => ({
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value),
});

export function useStore() {
  let value = $state('');
  $effect(() => { console.log(value); });
  return { get value() { return value; }, set value(v) { value = v; } };
}
