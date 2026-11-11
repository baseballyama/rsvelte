const source = { a: 1, b: { c: 2 }, d: [3, 4] };

export let { a } = source;
export let {
  b: { c },
} = source;
export let {
  d: [first, ...restOfD],
} = source;
export const { e = 5, ...rest } = source;

export function reassign() {
  ({ a } = { a: 10 });
  [first] = [20];
  return a + c + first + restOfD.length + e + Object.keys(rest).length;
}
