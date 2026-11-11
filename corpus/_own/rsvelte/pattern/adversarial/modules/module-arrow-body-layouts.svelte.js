let seed = $state(1);

export const identity = (x) => x;

export const nextLine = (x) => x + seed;

export const objectBody = (x) => ({
  x,
  seed,
});

export const nestedArrows = (a) => (b) => (c) => a + b + c + seed;

export const asyncArrow = async (x) => await Promise.resolve(x + seed);

export function bump() {
  seed += 1;
}
