let holder = $state({ nested: { fn: () => 1 } });

const value = $derived(holder?.nested?.fn?.() ?? 0);
const chained = $derived(holder?.["nested"]?.fn?.call(null) ?? -1);

export function clear() {
  holder = null;
}

export function read() {
  return `${value}/${chained}`;
}
