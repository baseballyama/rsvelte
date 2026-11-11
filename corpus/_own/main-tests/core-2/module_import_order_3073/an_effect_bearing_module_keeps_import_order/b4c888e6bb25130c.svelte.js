export { z } from './z.js';
import { q } from './q.js';
let v = $state(0);
$effect.root(() => { v = q; });
export const get = () => v;
