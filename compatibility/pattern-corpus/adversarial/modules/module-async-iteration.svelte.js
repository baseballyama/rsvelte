let seen = $state(0);

export async function* stream(limit) {
  for (let i = 0; i < limit; i++) {
    seen += 1;
    yield await Promise.resolve(i);
  }
}

export async function collect(limit) {
  const out = [];
  for await (const value of stream(limit)) out.push(value);
  return out;
}

export async function race() {
  return Promise.race([Promise.resolve(seen), Promise.resolve(-1)]);
}

export function read() {
  return seen;
}
