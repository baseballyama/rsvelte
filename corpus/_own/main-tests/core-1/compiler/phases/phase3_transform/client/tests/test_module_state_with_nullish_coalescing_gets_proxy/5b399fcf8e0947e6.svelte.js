
export function useStore(pData) {
  let data = $state(pData ?? { name: '' });
  return { get data() { return data; }, set data(v) { data = v; } };
}
