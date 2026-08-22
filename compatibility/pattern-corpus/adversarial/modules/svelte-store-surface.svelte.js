import { derived, get, readable, readonly, writable } from "svelte/store";
import { fromStore, toStore } from "svelte/store";

export const count = writable(0);
export const ticks = readable(0, (set) => {
  set(1);
  return () => {};
});
export const doubled = derived(count, ($count) => $count * 2);
export const pair = derived([count, ticks], ([a, b]) => a + b);
export const frozen = readonly(count);

let backing = $state(0);
export const bridged = toStore(
  () => backing,
  (value) => (backing = value),
);
export const unbridged = fromStore(count);

export function bump() {
  count.update((n) => n + 1);
  count.set(get(count) + 1);
  bridged.set(get(bridged) + 1);
  unbridged.current += 1;
  return [get(doubled), get(pair), get(frozen)];
}
