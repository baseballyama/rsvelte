import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Snippet_default_typescript_erased($$anchor) {
	const s = ($$anchor, $$arg0, $$arg1, $$arg2) => {
		let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), obj));
		let q = $.derived_safe_equal(() => $.fallback($$arg1?.(), n));
		let r = $.derived_safe_equal(() => $.fallback($$arg2?.(), "x"));
		$.next();
		var text = $.text();
		$.template_effect(() => $.set_text(text, `${$.get(p) ?? ""}${$.get(q) ?? ""}${$.get(r) ?? ""}`));
		$.append($$anchor, text);
	};
	let obj;
	let n = 1;
	s($$anchor);
}
