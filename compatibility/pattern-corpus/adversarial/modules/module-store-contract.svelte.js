let value = $state(0);

const subscribers = new Set();

export function subscribe(run) {
  subscribers.add(run);
  run(value);
  return () => {
    subscribers.delete(run);
  };
}

export function set(next) {
  value = next;
  for (const run of subscribers) run(value);
}

export function update(fn) {
  set(fn(value));
}

export const readonlyView = {
  subscribe,
  get current() {
    return value;
  },
};
