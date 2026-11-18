import * as $ from "svelte/internal/server";
import C from "./C.svelte";
export default function Slot_element_const($$renderer) {
	let k = 1;
	C($$renderer, { $$slots: { a: ($$renderer) => {
		const twice = k * 2;
		$$renderer.push(`<p slot="a">${$.escape(twice)}</p>`);
	} } });
	$$renderer.push(`<!----> <button></button>`);
}
