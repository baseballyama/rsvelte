import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input/> <input/> <input/> <p></p> `, 1);
export default function Binding_targets_a_function_or_a_global($$anchor, $$props) {
	$.push($$props, true);
	function a() {}
	class K {}
	var $$exports = { a };
	var fragment = root();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	var input_2 = $.sibling(input_1, 2);
	$.remove_input_defaults(input_2);
	var p = $.sibling(input_2, 2);
	$.bind_this(p, ($$value) => window.__el = $$value, () => window?.__el);
	var text = $.sibling(p);
	$.template_effect(() => $.set_text(text, ` ${a ?? ""}`));
	$.bind_value(input, () => a, ($$value) => a = $$value);
	$.bind_value(input_1, () => K, ($$value) => K = $$value);
	$.bind_value(input_2, () => foo.bar, ($$value) => foo.bar = $$value);
	$.append($$anchor, fragment);
	return $.pop($$exports);
}
