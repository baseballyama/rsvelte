let internal = $state(1);

function bump() {
  internal += 1;
}

function read() {
  return internal;
}

export { bump as increment, read as value };
export { read as default };

export function reset() {
  internal = 0;
}
