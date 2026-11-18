import * as $ from "svelte/internal/server";
export default function Derived_assign($$renderer) {
	let a = 1;
	let d = $.derived(() => a * 2);
	let e = $.derived(() => a);
	function f() {
		d(5);
		d(d() + 1);
		e(e() || 3);
	}
	$$renderer.push(`<button>${$.escape(d())}${$.escape(e())}</button>`);
}
