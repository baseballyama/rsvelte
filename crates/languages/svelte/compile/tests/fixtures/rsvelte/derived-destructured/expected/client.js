import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"element"
]);
var root = $.from_html(`<p> </p>`);
export default function Derived_destructured($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	let o = $.proxy({
		a: 1,
		b: [1, 2],
		c: {}
	});
	let $$array = $.derived(() => $.to_array(o.b, 2)), a = $.derived(() => o.a), x = $.derived(() => $.get($$array)[0]), y = $.derived(() => $.fallback($.get($$array)[1], f, true)), rest = $.derived(() => $.exclude_from_object(o, ["a", "b"]));
	let $$d = $.derived(() => [
		1,
		2,
		3
	]), $$array_1 = $.derived(() => $.to_array($.get($$d))), p = $.derived(() => $.get($$array_1)[0]), q = $.derived(() => $.fallback($.get($$array_1)[1], 1)), r = $.derived(() => $.get($$array_1).slice(2));
	let $$d_1 = $.derived(() => o.c), k = $.derived(() => $.fallback($.get($$d_1).k, 2)), z = $.derived(() => $.get($$d_1)["z"]), one = $.derived(() => $.get($$d_1)[1]);
	let title = $.derived(() => $$props.title), slots = $.derived(() => $$props.$$slots);
	let cast = $.derived(() => $.get(a));
	function f() {
		return 1;
	}
	var p_1 = root();
	var text = $.only_child(p_1);
	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ""} ${$.get(x) ?? ""} ${$.get(y) ?? ""} ${$.get(rest) ?? ""} ${$.get(p) ?? ""} ${$.get(q) ?? ""} ${$.get(r) ?? ""} ${$.get(k) ?? ""} ${$.get(z) ?? ""} ${$.get(one) ?? ""} ${$.get(title) ?? ""} ${$.get(slots) ?? ""} ${$.get(cast) ?? ""} ${$$props.element ?? ""}`));
	$.append($$anchor, p_1);
}
