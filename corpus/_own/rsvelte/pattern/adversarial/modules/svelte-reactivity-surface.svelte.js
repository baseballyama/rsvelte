import {
  SvelteDate,
  SvelteMap,
  SvelteSet,
  SvelteURL,
  SvelteURLSearchParams,
} from "svelte/reactivity";

export const map = new SvelteMap([["a", 1]]);
export const set = new SvelteSet([1, 2]);
export const date = new SvelteDate(0);
export const url = new SvelteURL("https://example.com/a?b=1");
export const params = new SvelteURLSearchParams("b=1");

const size = $derived(map.size + set.size);

export function mutate() {
  map.set("b", 2);
  set.add(3);
  date.setTime(1);
  url.pathname = "/c";
  params.set("d", "2");
  return size;
}

export function read() {
  const keys = [...map.keys(), ...set.values()];
  return [keys, date.getTime(), url.href, params.toString()];
}
