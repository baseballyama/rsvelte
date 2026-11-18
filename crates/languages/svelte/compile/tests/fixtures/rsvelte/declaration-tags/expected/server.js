import * as $ from "svelte/internal/server";
export default function Declaration_tags($$renderer) {
	let shown = true;
	let start = 3;
	let n = 0, twice = $.derived(() => n * 2);
	$$renderer.push(`<button>${$.escape(n)} ${$.escape(twice())}</button> `);
	if (shown) {
		$$renderer.push("<!--[0-->");
		let box = { v: start };
		const label = "v: ";
		$$renderer.push(`<p>v: ${$.escape(box.v)}</p> `);
		{
			const label = "inner";
			let t = $.derived(() => twice() + 1);
			$$renderer.push(`<section><i>inner ${$.escape(t())}</i></section>`);
		}
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array = $.ensure_array_like([1, 2]);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		let el = void 0;
		$$renderer.push(`<b>${$.escape(item)}</b>`);
	}
	$$renderer.push(`<!--]-->`);
}
