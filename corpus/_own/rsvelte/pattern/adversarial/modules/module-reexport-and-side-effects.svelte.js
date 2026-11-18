let counter = $state(0);

const registry = new Map();

registry.set("initial", counter);

if (counter === 0) {
  counter = 1;
}

for (const key of ["a", "b"]) {
  registry.set(key, counter);
}

export { registry };

export function bump() {
  counter += 1;
  registry.set("last", counter);
  return counter;
}

export default bump;
