let inner = $state(1);

export const frozen = Object.freeze({ k: 1 });

export const view = Object.defineProperties(
  {},
  {
    value: {
      get() {
        return inner;
      },
      enumerable: true,
    },
    constant: { value: 2, enumerable: true },
  },
);

export function bump() {
  inner += 1;
  return `${view.value}:${view.constant}:${frozen.k}`;
}
