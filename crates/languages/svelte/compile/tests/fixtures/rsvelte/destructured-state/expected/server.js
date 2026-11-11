import * as $ from "svelte/internal/server";
export function make() {
	let tmp = get(), h = tmp.h, i = $.fallback(tmp.i, 1);
	let tmp_1 = get(), $$array = $.to_array(tmp_1, 1), j = $$array[0];
	return () => {
		h = 1;
		j = 2;
		return [
			h,
			i,
			j
		];
	};
}
export default function Destructured_state($$renderer) {
	let tmp_2 = get(), a = tmp_2.a, bb = tmp_2.b, c = $.fallback(tmp_2.c, 1), rest = $.exclude_from_object(tmp_2, [
		"a",
		"b",
		"c"
	]);
	let tmp_3 = [10, "Admin"], $$array_1 = $.to_array(tmp_3), one = $$array_1[0], two = $.fallback($$array_1[1], 2), others = $$array_1.slice(2);
	const tmp_4 = get(), d = tmp_4.d;
	let tmp_5 = obj, e = tmp_5.e;
	let tmp_6 = get(), $$array_2 = $.to_array(tmp_6, 1), f = $$array_2[0];
	let tmp_7 = get(), g = tmp_7.g;
	$$renderer.push(`<button>${$.escape(a)}${$.escape(bb)}${$.escape(c)}${$.escape(rest)}${$.escape(one)}${$.escape(two)}${$.escape(others)}${$.escape(d)}${$.escape(e)}${$.escape(f)}${$.escape(g)}</button>`);
}
