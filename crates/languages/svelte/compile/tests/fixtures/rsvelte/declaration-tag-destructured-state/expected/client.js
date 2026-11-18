import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p> <button>x</button>`, 1);
export default function Declaration_tag_destructured_state($$anchor) {
	let tmp = [1], $$array = $.derived(() => $.to_array(tmp, 1)), a = $.state($.proxy($.get($$array)[0])), b = $.state(2), $$d = $.derived(() => ({ c: $.get(a) + $.get(b) })), c = $.derived(() => $.get($$d).c);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);
	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ""}${$.get(b) ?? ""}${$.get(c) ?? ""}`));
	$.delegated("click", button, () => {
		$.update(a);
		$.update(b);
	});
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
