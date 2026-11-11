let other = {}, o = { p: 1 }, c = true, a = 1, b = 2, backend = { init: () => ({}) };
let v = $state(0);
export async function go() {
	v = (function () { return 1; })();
}
