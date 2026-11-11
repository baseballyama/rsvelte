let mode = $state("a");

const table = {
  a: () => 1,
  b: () => 2,
};

export function pick(key) {
  switch (key) {
    case "a":
    case "b": {
      mode = key;
      return table[key]();
    }
    default:
      return 0;
  }
}

export function scan(rows) {
  const out = [];
  for (const [index, row] of rows.entries()) {
    if (index % 2 === 0) continue;
    out.push(`${mode}${row}`);
  }
  return out;
}

export function read() {
  return mode;
}
