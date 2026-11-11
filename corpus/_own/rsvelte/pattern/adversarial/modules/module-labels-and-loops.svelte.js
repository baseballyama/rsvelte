let total = $state(0);

export function walk(rows) {
  outer: for (const row of rows) {
    for (const cell of row) {
      if (cell < 0) continue outer;
      if (cell === 0) break outer;
      total += cell;
    }
  }

  let guard = 0;

  do {
    guard += 1;
  } while (guard < 3);

  return guard;
}

export function read() {
  return total;
}
