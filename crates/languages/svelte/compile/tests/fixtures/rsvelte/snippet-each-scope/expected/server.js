import * as $ from "svelte/internal/server";
export default function Snippet_each_scope($$renderer) {
	let s = "outer";
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like([1]);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let x = each_array[$$index];
		function s($$renderer) {
			$$renderer.push(`<p>${$.escape(x)}</p>`);
		}
		s($$renderer);
	}
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array_1 = $.ensure_array_like([2]);
	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let y = each_array_1[$$index_1];
		$$renderer.push(`<p>${$.escape(y)}</p>`);
	}
	$$renderer.push(`<!--]--> outer`);
}
