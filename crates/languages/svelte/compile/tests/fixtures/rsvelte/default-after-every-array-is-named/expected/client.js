import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Default_after_every_array_is_named($$anchor) {
	let tmp = [], $$array = $.derived(() => $.to_array(tmp, 2)), $$array_1 = $.derived(() => $.to_array($.get($$array)[1], 1)), a = $.proxy($.fallback($.get($$array)[0], () => {
		let tmp_1 = [1], $$array_2 = $.derived(() => $.to_array(tmp_1, 1)), x = $.proxy($.get($$array_2)[0]);
		return x;
	})), b = $.proxy($.get($$array_1)[0]);
	var p = root();
	var text = $.only_child(p);
	$.template_effect(($0) => $.set_text(text, `${$0 ?? ""}${b ?? ""}`), [() => a()]);
	$.append($$anchor, p);
}
