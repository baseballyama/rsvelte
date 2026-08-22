let attempts = $state(0);
let last = $state("");

export function run(fn) {
  try {
    attempts += 1;
    return fn();
  } catch ({ message = "none" }) {
    last = message;
    return null;
  } finally {
    attempts += 0;
  }
}

export function state() {
  return `${attempts}/${last}`;
}
