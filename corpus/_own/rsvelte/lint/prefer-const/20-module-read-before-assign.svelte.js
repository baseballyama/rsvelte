/* eslint svelte/prefer-const: ["warn", { "ignoreReadBeforeAssign": true }] */
let timer;
const peek = () => timer;
timer = peek() ?? 1;
let normal;
normal = 2;
let inited = 0;
function early() {
	return inited;
}
void [timer, normal, inited, early];
