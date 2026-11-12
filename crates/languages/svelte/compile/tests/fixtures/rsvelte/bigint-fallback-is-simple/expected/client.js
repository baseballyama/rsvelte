import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
const s = ($$anchor, $$arg0) => {
	let q = $.derived_safe_equal(() => $.fallback($$arg0?.(), 2n));
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, $.get(q)));
	$.append($$anchor, text);
};
var root = $.from_html(`<!> `, 1);
export default function Bigint_fallback_is_simple($$anchor, $$props) {
	let p = $.prop($$props, "p", 3, 1n);
	var fragment_1 = root();
	var node = $.first_child(fragment_1);
	s(node);
	var text_1 = $.sibling(node);
	$.template_effect(() => $.set_text(text_1, ` ${p() ?? ""}`));
	$.append($$anchor, fragment_1);
}
