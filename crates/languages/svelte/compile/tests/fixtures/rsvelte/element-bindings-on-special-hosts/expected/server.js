import * as $ from "svelte/internal/server";
export default function Element_bindings_on_special_hosts($$renderer) {
	let w = 0;
	let item = { w: 0 };
	let tag = "div";
	let h = "";
	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`x`);
	});
	$$renderer.push(` `);
	$.element($$renderer, tag, () => {
		$$renderer.push(` contenteditable="true"`);
	}, () => {
		$$renderer.push(`y`);
	});
	$$renderer.push(` <p>${$.escape(w)}${$.escape(h)}${$.escape(item.w)}</p>`);
}
