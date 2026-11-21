import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Runes_slots_read($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);
			$.template_effect(() => $.set_text(text, $$props.a));
			$.append($$anchor, p);
		};
		$.if(node, ($$render) => {
			if ($$slots.default) $$render(consequent);
		});
	}
	$.append($$anchor, fragment);
}
