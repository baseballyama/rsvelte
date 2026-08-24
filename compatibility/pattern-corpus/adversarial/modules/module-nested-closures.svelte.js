let base = $state(1);

export function makeCounter(step) {
  let local = 0;

  return {
    inc() {
      local += step + base;
      return local;
    },
    reset: () => {
      local = 0;
      return local;
    },
    get value() {
      return local;
    },
  };
}

export const compose =
  (...fns) =>
  (input) =>
    fns.reduce((acc, fn) => fn(acc), input + base);

export function bump() {
  base += 1;
}
