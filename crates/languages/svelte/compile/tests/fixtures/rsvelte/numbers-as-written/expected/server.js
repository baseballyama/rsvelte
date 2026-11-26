import * as $ from "svelte/internal/server";
export default function Numbers_as_written($$renderer, $$props) {
	let o = {
		0x10: 1,
		[0b11]: 2,
		0o17: 3,
		1_000: 4,
		1e-7: 5,
		0x1fn: 6,
		.5: 7
	};
	let { 0x10: a, 1e3: b, 1_000: c, $$slots, $$events, ...rest } = $$props;
	let m = o.x ?? 0xff;
	let xs = [];
	$$renderer.push(`<!---->${$.escape(a)}${$.escape(b)}${$.escape(c)}${$.escape(m)}${$.escape(rest)} <!--[-->`);
	const each_array = $.ensure_array_like(xs);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let x = each_array[$$index];
		const { 0x10: d } = x;
		$$renderer.push(`<!---->${$.escape(d)}`);
	}
	$$renderer.push(`<!--]-->`);
}
