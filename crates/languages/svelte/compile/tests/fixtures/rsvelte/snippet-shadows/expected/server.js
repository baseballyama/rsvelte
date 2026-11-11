import * as $ from "svelte/internal/server";
import List from "./List.svelte";
export default function Snippet_shadows($$renderer, $$props) {
	let { item, label } = $$props;
	let count = 0;
	let items = [1];
	if (label) {
		$$renderer.push("<!--[0-->");
		function item($$renderer) {
			$$renderer.push(`<b>snippet</b>`);
		}
		function count($$renderer) {
			$$renderer.push(`<!---->x`);
		}
		$$renderer.push(`<div>`);
		item($$renderer);
		$$renderer.push(`<!----></div> <p>`);
		count($$renderer);
		$$renderer.push(`<!----></p>`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <button>${$.escape(count)}</button> <!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let row = each_array[$$index];
		function row($$renderer) {
			$$renderer.push(`<!---->r`);
		}
		$$renderer.push(`<div>`);
		if (label) {
			$$renderer.push("<!--[0-->");
			row($$renderer);
		} else {
			$$renderer.push("<!--[-1-->");
		}
		$$renderer.push(`<!--]--><i${$.attr("title", String(row))}></i></div>`);
	}
	$$renderer.push(`<!--]--> `);
	{
		function label($$renderer) {
			label?.($$renderer);
		}
		List($$renderer, {
			label,
			$$slots: { label: true }
		});
	}
	$$renderer.push(`<!---->`);
}
