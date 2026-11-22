import * as $ from "svelte/internal/server";
export default function Newline_self_closing($$renderer) {
	function f(node, p) {
		return {};
	}
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like([1]);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let x = each_array[$$index];
		$$renderer.push(`<div></div>`);
	}
	$$renderer.push(`<!--]-->`);
}
