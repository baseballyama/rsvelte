import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Exported_const_state($$anchor, $$props) {
	$.push($$props, true);
	const o = $.proxy({ a: 1 });
	const r = [1];
	function f() {
		o.a++;
	}
	var $$exports = {
		o,
		r
	};
	var button = root();
	var text = $.only_child(button);
	$.template_effect(() => $.set_text(text, `${o.a ?? ""}${r.length ?? ""}`));
	$.delegated("click", button, f);
	$.append($$anchor, button);
	return $.pop($$exports);
}
$.delegate(["click"]);
