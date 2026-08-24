let value = $state(1);

export function shadowing(value) {
  {
    let inner = value;
    if (inner) {
      const value = inner + 1;
      inner = value;
    }
    return inner;
  }
}

export function loopShadow() {
  let total = 0;
  for (let value = 0; value < 3; value++) total += value;
  for (const value of [1, 2]) total += value;
  return total;
}

export function read() {
  return value;
}
