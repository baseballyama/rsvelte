export const constant = 1;
export let mutable = 2;

let internal = $state(3);

export function bump() {
  mutable += 1;
  internal += 1;
  return internal;
}

export const table = {
  constant,
  get mutable() {
    return mutable;
  },
  get internal() {
    return internal;
  },
};
