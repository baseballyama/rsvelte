import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<span></span> <div><button>b</button></div>`, 1);
export default function Snippet_element_memo($$anchor) {
	let o = $.proxy({ t: "A" });
	const f = (x) => x;
	var fragment = root();
	var span = $.first_child(fragment);
	var div = $.sibling(span, 2);
	{
		const s = ($$anchor) => {
			$.next();
			var text = $.text("x");
			$.append($$anchor, text);
		};
		var button = $.only_child(div);
		$.template_effect(($0) => $.set_class(button, 1, $0), [() => $.clsx(f(o.t) ? "c" : "")]);
	}
	$.template_effect(($0) => $.set_class(span, 1, `b ${$0 ?? ""}`), [() => o.t.toLowerCase()]);
	$.append($$anchor, fragment);
}
