let total = $state(0);

export function run(matrix) {
  outer: for (const row of matrix) {
    inner: for (const cell of row) {
      switch (cell) {
        case 0:
          continue inner;
        case -1:
          break outer;
        default: {
          total += cell;
        }
      }
    }
  }

  block: {
    if (total > 100) break block;
    total += 1;
  }

  return total;
}
