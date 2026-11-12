import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<b> </b>`);
export default function Declared_dollar_props_is_renamed($$anchor) {
	function f($$sanitized_props) {
		return $$sanitized_props;
	}
	var b = root();
	var text = $.only_child(b, true);
	$.template_effect(($0) => $.set_text(text, $0), [() => f(1)]);
	$.append($$anchor, b);
}
