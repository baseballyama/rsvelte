import * as $ from "svelte/internal/server";
export default function Assignment_pattern_array_names($$renderer, $$props) {
	let cheese = ["a", "b"];
	let other = [1, [2, 3]];
	function swap(a, b) {
		let x, y, z;
		[x, [y, z]] = other;
		({x, y: [z]} = {
			x: 1,
			y: [2]
		});
		for ([x, y] of [[1, 2]]) {}
	}
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(cheese);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let cheese = each_array[$$index];
		$$renderer.push(`<li>${$.escape(cheese)}</li>`);
	}
	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { swap });
}
