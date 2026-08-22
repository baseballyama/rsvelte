import defaultExport, { get, writable as renamed } from "svelte/store";
import * as namespace from "svelte/motion";

let loaded = $state(null);

export async function load() {
  const mod = await import("svelte/easing");
  loaded = mod;
  return import.meta.url;
}

export function read() {
  return [defaultExport, get, renamed, namespace, loaded].length;
}
