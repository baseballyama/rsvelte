import * as $ from "svelte/internal/server";
export default function Derived_destructured($$renderer, $$props) {
	let { element, $$slots, $$events, ...props } = $$props;
	let o = {
		a: 1,
		b: [1, 2],
		c: {}
	};
	let $$derived_array = $.derived(() => $.to_array(o.b, 2)), a = $.derived(() => o.a), x = $.derived(() => $$derived_array()[0]), y = $.derived(() => $.fallback($$derived_array()[1], f, true)), rest = $.derived(() => $.exclude_from_object(o, ["a", "b"]));
	let $$d = $.derived(() => [
		1,
		2,
		3
	]), $$derived_array_1 = $.derived(() => $.to_array($$d())), p = $.derived(() => $$derived_array_1()[0]), q = $.derived(() => $.fallback($$derived_array_1()[1], 1)), r = $.derived(() => $$derived_array_1().slice(2));
	let $$d_1 = $.derived(() => o.c), k = $.derived(() => $.fallback($$d_1().k, 2)), z = $.derived(() => $$d_1()["z"]), one = $.derived(() => $$d_1()[1]);
	let title = $.derived(() => props.title), slots = $.derived(() => props.$$slots);
	let cast = $.derived(a);
	function f() {
		return 1;
	}
	$$renderer.push(`<p>${$.escape(a())} ${$.escape(x())} ${$.escape(y())} ${$.escape(rest())} ${$.escape(p())} ${$.escape(q())} ${$.escape(r())} ${$.escape(k())} ${$.escape(z())} ${$.escape(one())} ${$.escape(title())} ${$.escape(slots())} ${$.escape(cast())} ${$.escape(element)}</p>`);
}
