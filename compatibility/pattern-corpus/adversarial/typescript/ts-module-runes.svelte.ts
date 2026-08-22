let count = $state(0);
const doubled = $derived(count * 2);

export function bump(step) {
  count += step;
}

export const view = {
  get count() {
    return count;
  },
  get doubled() {
    return doubled;
  },
};

export const pair = $state({ a: 1, b: "two" });
