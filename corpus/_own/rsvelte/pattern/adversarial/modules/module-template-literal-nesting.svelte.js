let name = $state("a");

const nested = $derived(`outer ${`inner ${name} ${`deep ${name}`}`} end`);

export function tag(strings, ...values) {
  return strings.raw.join("|") + values.join(",");
}

const tagged = $derived(tag`a${name}b${name}c`);

export function read() {
  return nested + tagged;
}
