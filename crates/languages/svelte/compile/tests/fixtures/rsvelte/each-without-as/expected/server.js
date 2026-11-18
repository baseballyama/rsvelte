import * as $ from "svelte/internal/server";
export default function Each_without_as($$renderer, $$props) {
	let { items = [], count = 2 } = $$props;
	let item = "outer";
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		$$renderer.push(`<p>outer</p>`);
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array_1 = $.ensure_array_like(items);
	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		$$renderer.push(`<p>${$.escape(i)}</p>`);
	}
	$$renderer.push(`<!--]--> `);
	const each_array_2 = $.ensure_array_like({ length: count });
	if (each_array_2.length !== 0) {
		$$renderer.push("<!--[-->");
		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			$$renderer.push(`<span>${$.escape(i)}</span>`);
		}
	} else {
		$$renderer.push(`<!--[!--><!---->none`);
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array_3 = $.ensure_array_like({ length: 3 });
	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		$$renderer.push(`<b>y</b>`);
	}
	$$renderer.push(`<!--]-->`);
}
