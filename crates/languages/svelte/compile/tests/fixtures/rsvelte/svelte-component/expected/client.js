import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import A from "./A.svelte";
var root = $.from_html(`<!> <!> <!>`, 1);
export default function Svelte_component($$anchor, $$props) {
	let depth = $.prop($$props, "depth", 3, 0);
	let current = $.proxy(A);
	var fragment = root();
	var node = $.first_child(fragment);
	$.component(node, () => current, ($$anchor, $$component) => {
		$$component($$anchor, {
			label: "x",
			get depth() {
				return depth();
			}
		});
	});
	var node_1 = $.sibling(node, 2);
	$.component(node_1, () => $$props.other ?? A, ($$anchor, $$component) => {
		$$component($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();
				var text = $.text();
				$.template_effect(() => $.set_text(text, `text ${depth() ?? ""}`));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});
	var node_2 = $.sibling(node_1, 2);
	{
		var consequent = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);
			{
				let $0 = $.derived(() => depth() + 1);
				Svelte_component(node_3, { get depth() {
					return $.get($0);
				} });
			}
			$.append($$anchor, fragment_2);
		};
		$.if(node_2, ($$render) => {
			if (depth() < 3) $$render(consequent);
		});
	}
	$.append($$anchor, fragment);
}
