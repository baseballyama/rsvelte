import * as $ from "svelte/internal/server";
export default function Bind_this_const($$renderer) {
	let items = [{ id: 1 }];
	let els = {};
	let refs = [];
	let n = 0;
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];
		const key = item.id;
		const k2 = key + n;
		$$renderer.push(`<div></div> <p></p> `);
		if (n) {
			$$renderer.push("<!--[0-->");
			const inner = item.id;
			$$renderer.push(`<span></span>`);
		} else {
			$$renderer.push("<!--[-1-->");
		}
		$$renderer.push(`<!--]-->`);
	}
	$$renderer.push(`<!--]-->`);
}
