export const list = $state([1, 2, 3]);
export const map = $state(new Map([["a", 1]]));
export const set = $state(new Set([1]));
export const nested = $state({ deep: { items: [{ id: 1 }] } });

export function mutate() {
  list.push(list.length + 1);
  map.set("b", 2);
  set.add(2);
  nested.deep.items[0].id += 1;
}
