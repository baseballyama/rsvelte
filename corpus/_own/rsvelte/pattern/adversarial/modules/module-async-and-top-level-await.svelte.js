const ready = await Promise.resolve(1);

let count = $state(ready);

export async function bump() {
  count += await Promise.resolve(1);
  return count;
}

export const settled = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error("x")),
]);

export function read() {
  return `${count}/${settled.length}`;
}
