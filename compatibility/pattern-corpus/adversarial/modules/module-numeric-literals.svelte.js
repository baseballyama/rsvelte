let total = $state(0);

const values = [
  0x1f,
  0b1010,
  0o17,
  1_000_000,
  1e3,
  1e-3,
  0.5,
  5.0,
  9007199254740993n,
  0xffn,
  Number.MAX_SAFE_INTEGER,
  Infinity,
  NaN,
];

export function sum() {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) total += v;
  }
  return total;
}
