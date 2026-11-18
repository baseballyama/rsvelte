/* eslint svelte/no-inner-declarations: ["warn", "both"] */
export const flag = true;
if (flag) {
	var leaked = 1;
}
export { leaked };
