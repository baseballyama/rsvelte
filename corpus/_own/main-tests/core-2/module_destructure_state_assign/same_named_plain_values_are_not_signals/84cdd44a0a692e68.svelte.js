import { y } from "./other.js";
export function f() { let [y] = $state([1]); y = 2; return y; }
export const g = () => y;
