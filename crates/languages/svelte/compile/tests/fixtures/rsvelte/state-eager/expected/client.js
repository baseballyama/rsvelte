import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
var root = $.from_html(`<div> </div> <div> </div> <button> </button>`, 1);
export default function State_eager($$anchor, $$props) {
	$.push($$props, true);
	let props = $.rest_props($$props, rest_excludes);
	let n = $.state(0);
	const value = $.derived(() => $$props.number ?? 0);
	const e = $.eager(() => $.get(n));
	function f() {
		return $.eager(() => $.get(n)) + 1;
	}
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);
	var button = $.sibling(div_1, 2);
	var text_2 = $.only_child(button);
	$.template_effect(($0, $1, $2) => {
		$.set_text(text, `value=${$.get(value) ?? ""}`);
		$.set_text(text_1, `eager=${$0 ?? ""}`);
		$.set_text(text_2, `${e ?? ""}${$1 ?? ""}${$2 ?? ""}`);
	}, [
		() => $.eager(() => $.get(value)),
		() => f(),
		() => $.eager(() => $.get(n))
	]);
	$.delegated("click", button, () => $.update(n));
	$.append($$anchor, fragment);
	$.pop();
}
$.delegate(["click"]);
