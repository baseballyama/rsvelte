import * as $ from "svelte/internal/server";
export default function Global_functions_fold($$renderer) {
	let n = 1;
	const a = Number.parseInt(" -0x1f");
	const b = Number.parseInt("z", 36);
	const c = Number.parseFloat("1e3x");
	const d = String.fromCharCode(72, 105);
	const e = String.fromCodePoint(128512);
	const f = Math.f16round(1.337);
	const g = Math.round(-.4);
	const h = Math.pow(1, "x");
	const i = Math.max(...[1, n]);
	$$renderer.push(`<p>-31 35 1000 Hi 😀 1.3369140625 0 NaN ${$.escape(i)}</p> <p>${$.escape(1 ** Infinity)}</p>`);
}
