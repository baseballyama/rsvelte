import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Derived_assign($$anchor) {
	let a = 1;
	let d = $.derived(() => a * 2);
	let e = $.derived(() => a);
	function f() {
		$.set(d, 5);
		$.set(d, $.get(d) + 1);
		$.set(e, $.get(e) || 3);
	}
	var button = root();
	var text = $.only_child(button);
	$.template_effect(() => $.set_text(text, `${$.get(d) ?? ""}${$.get(e) ?? ""}`));
	$.delegated("click", button, () => $.set(d, !$.get(d)));
	$.append($$anchor, button);
}
$.delegate(["click"]);
