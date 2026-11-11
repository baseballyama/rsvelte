import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Inspect_dropped($$anchor, $$props) {
	$.push($$props, true);
	let a = $.state(1);
	let b = $.derived(() => $.get(a) * 2);
	;
	;
	;
	;
	function f() {
		;
		;
		return $.get(a);
	}
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(($0) => $.set_text(text, $0), [() => f()]);
	$.delegated("click", button, () => {
		;
		;
		$.update(a);
	});
	$.append($$anchor, button);
	$.pop();
}
$.delegate(["click"]);
