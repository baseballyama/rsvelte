import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Snippet_parameter_default_props($$anchor, $$props) {
	$.push($$props, true);
	const t = ($$anchor, p = $.noop, $$arg1, $$arg2, $$arg3) => {
		let v = $.derived_safe_equal(() => $.fallback($$arg1?.(), p(), true));
		let w = $.derived_safe_equal(() => $.fallback($$arg2?.(), $$props.f, true));
		let z = $.derived_safe_equal(() => $.fallback($$arg3?.(), () => (() => 2)(), true));
		$.next();
		var text = $.text();
		$.template_effect(() => $.set_text(text, `${$.get(v) ?? ""}${$.get(w) ?? ""}${$.get(z) ?? ""}`));
		$.append($$anchor, text);
	};
	t($$anchor, () => 1);
	$.pop();
}
