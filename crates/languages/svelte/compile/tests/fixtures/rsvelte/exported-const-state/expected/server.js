import * as $ from "svelte/internal/server";
export default function Exported_const_state($$renderer, $$props) {
	const o = { a: 1 };
	const r = [1];
	function f() {
		o.a++;
	}
	$$renderer.push(`<button>${$.escape(o.a)}${$.escape(r.length)}</button>`);
	$.bind_props($$props, {
		o,
		r
	});
}
