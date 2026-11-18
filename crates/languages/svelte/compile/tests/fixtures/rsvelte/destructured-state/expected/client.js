import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export function make() {
	let tmp = get(), h = $.state($.proxy(tmp.h)), i = $.proxy($.fallback(tmp.i, 1));
	let tmp_1 = get(), $$array = $.derived(() => $.to_array(tmp_1, 1)), j = $.state($.get($$array)[0]);
	return () => {
		$.set(h, 1);
		$.set(j, 2);
		return [
			$.get(h),
			i,
			$.get(j)
		];
	};
}
var root = $.from_html(`<button> </button>`);
export default function Destructured_state($$anchor) {
	let tmp_2 = get(), a = $.state($.proxy(tmp_2.a)), bb = $.state($.proxy(tmp_2.b)), c = $.state($.proxy($.fallback(tmp_2.c, 1))), rest = $.proxy($.exclude_from_object(tmp_2, [
		"a",
		"b",
		"c"
	]));
	let tmp_3 = [10, "Admin"], $$array_1 = $.derived(() => $.to_array(tmp_3)), one = $.state($.proxy($.get($$array_1)[0])), two = $.proxy($.fallback($.get($$array_1)[1], 2)), others = $.state($.proxy($.get($$array_1).slice(2)));
	const tmp_4 = get(), d = $.proxy(tmp_4.d);
	let tmp_5 = obj, e = $.proxy(tmp_5.e);
	let tmp_6 = get(), $$array_2 = $.derived(() => $.to_array(tmp_6, 1)), f = $.state($.proxy($.get($$array_2)[0]));
	let tmp_7 = get(), g = $.state(tmp_7.g);
	var button = root();
	var text = $.only_child(button);
	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ""}${$.get(bb) ?? ""}${$.get(c) ?? ""}${rest ?? ""}${$.get(one) ?? ""}${two ?? ""}${$.get(others) ?? ""}${d ?? ""}${e ?? ""}${$.get(f) ?? ""}${$.get(g) ?? ""}`));
	$.delegated("click", button, () => {
		$.update(a);
		$.set(one, 3);
		$.set(bb, 1);
		rest.x;
		$.update(c);
		$.set(others, [], true);
		$.update(f);
		$.set(g, 1);
	});
	$.append($$anchor, button);
}
$.delegate(["click"]);
