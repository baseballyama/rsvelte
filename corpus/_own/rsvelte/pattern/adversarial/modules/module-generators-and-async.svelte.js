let seen = $state(0);

export function* counter(limit) {
  for (let i = 0; i < limit; i++) {
    seen += 1;
    yield i;
  }
}

export async function* streamed(limit) {
  for (const n of counter(limit)) {
    yield await Promise.resolve(n);
  }
}

export async function total(limit) {
  let sum = 0;
  for await (const n of streamed(limit)) sum += n;
  return sum;
}

export function seenCount() {
  return seen;
}
