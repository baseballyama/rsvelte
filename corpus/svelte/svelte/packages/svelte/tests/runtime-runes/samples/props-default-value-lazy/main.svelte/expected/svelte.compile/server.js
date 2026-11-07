import * as $ from 'svelte/internal/server';
import Sub from "./sub.svelte";

export default function Main($$renderer) {
	let p0 = 0;
	let p1 = 0;
	let p2 = 0;
	let p3 = 0;
	let p4 = void 0;
	let p5 = void 0;
	let p6 = void 0;
	let p7 = void 0;

	Sub($$renderer, { p0, p1, p2, p3, p4, p5, p6, p7 });
	$$renderer.push(`<!----> <button>Set all to undefined</button>`);
}