import * as $ from "svelte/internal/server";
export default function Default_after_every_array_is_named($$renderer) {
	let tmp = [], $$array = $.to_array(tmp, 2), $$array_1 = $.to_array($$array[1], 1), a = $.fallback($$array[0], () => {
		let tmp_1 = [1], $$array_2 = $.to_array(tmp_1, 1), x = $$array_2[0];
		return x;
	}), b = $$array_1[0];
	$$renderer.push(`<p>${$.escape(a())}${$.escape(b)}</p>`);
}
