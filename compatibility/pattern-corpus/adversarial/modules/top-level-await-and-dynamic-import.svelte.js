const loaded = await Promise.resolve(1);

let n = $state(loaded);

const doubled = $derived(n * 2);

export async function load(path) {
  const mod = await import(path);
  return mod;
}

export const meta = import.meta.url;

export function bump() {
  n += 1;
  return doubled;
}

for await (const value of (async function* () {
  yield 1;
})()) {
  n += value;
}
