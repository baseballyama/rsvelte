export * from "svelte/store";
export * as motion from "svelte/motion";
export { untrack as reexported } from "svelte";

let internal = $state(0);

function bump() {
  internal += 1;
  return internal;
}

const alias = bump;

export { alias as default, bump as named };

export const table = {
  get internal() {
    return internal;
  },
};
