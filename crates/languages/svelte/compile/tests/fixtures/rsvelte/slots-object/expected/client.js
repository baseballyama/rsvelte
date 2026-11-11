import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"title"
]);
var root = $.from_html(`<header><!></header>`);
var root_1 = $.from_html(`<!> <h1> </h1> <!>`, 1);
export default function Slots_object($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	let rest = $.rest_props($$props, rest_excludes);
	const named = $$slots.header ? "with" : "without";
	var fragment = root_1();
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			var header = root();
			var node_1 = $.child(header);
			$.slot(node_1, $$props, "header", {}, null);
			$.reset(header);
			$.append($$anchor, header);
		};
		$.if(node, ($$render) => {
			if ($$slots.header) $$render(consequent);
		});
	}
	var h1 = $.sibling(node, 2);
	$.attribute_effect(h1, () => ({ ...rest }));
	var text = $.only_child(h1);
	var node_2 = $.sibling(h1, 2);
	$.slot(node_2, $$props, "default", {}, null);
	$.template_effect(() => $.set_text(text, `${$$props.title ?? ""} ${named}`));
	$.append($$anchor, fragment);
}
