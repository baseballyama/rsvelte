export const a = 1;
import { b } from './b.js';
let c = $state(0);
export function inc() { c += b; }
