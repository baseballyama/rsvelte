import * as $ from "svelte/internal/server";
import Imp from "./Imp.svelte";
export default function Export_specifiers($$renderer, $$props) {
	let { p = 1, q } = $$props;
	let a = 1;
	let s = 0;
	let r = 0;
	let d = $.derived(() => s * 2);
	let l = 0;
	const c = 3;
	function f() {
		a = 0;
		s = 1;
		r = 2;
		l = 2;
		p = 3;
		q = 4;
		K = class {};
	}
	let K = class {};
	const z = 1;
	$$renderer.push(`<p>${$.escape(s)} ${$.escape(l)} ${$.escape(a)}</p>`);
	$.bind_props($$props, {
		a,
		b: a,
		s,
		r,
		d,
		lll: l,
		"c-d": c,
		f,
		K,
		Imp,
		p,
		q,
		z
	});
}
