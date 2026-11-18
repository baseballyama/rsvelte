
export function useStore(pData) {
  let data = $state(pData || []);
  return { get data() { return data; }, set data(v) { data = v; } };
}
