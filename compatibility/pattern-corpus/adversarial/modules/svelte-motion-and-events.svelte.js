import { on } from "svelte/events";
import { Spring, Tween } from "svelte/motion";
import { cubicOut } from "svelte/easing";

export const tween = new Tween(0, { duration: 100, easing: cubicOut });
export const spring = new Spring(0, { stiffness: 0.1, damping: 0.5 });

export const fromValue = Tween.of(() => 1);
export const springFrom = Spring.of(() => 2);

let n = $state(0);

export function drive(node) {
  const off = on(node, "click", () => (n += 1), { capture: true });
  tween.set(n);
  tween.target = n;
  spring.set(n, { instant: true });
  spring.target = n;
  return off;
}

export function read() {
  return [tween.current, spring.current, fromValue.current, springFrom.current];
}
