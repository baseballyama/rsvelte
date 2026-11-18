import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import List from "./List.svelte";
var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<h1>Title</h1>`);
var root_2 = $.from_html(`<p>Body</p>`);
var root_3 = $.from_html(`<!> <!>`, 1);
export default function Snippet_component_props($$anchor, $$props) {
	var fragment = root_3();
	var node = $.first_child(fragment);
	{
		const item = ($$anchor, value = $.noop) => {
			var span = root();
			var text = $.only_child(span, true);
			$.template_effect(() => $.set_text(text, value()));
			$.append($$anchor, span);
		};
		const children = ($$anchor, value = $.noop) => {
			$$props.children?.($$anchor, value);
		};
		List(node, {
			item,
			children,
			$$slots: {
				item: true,
				default: true
			}
		});
	}
	var node_1 = $.sibling(node, 2);
	{
		const header = ($$anchor) => {
			var h1 = root_1();
			$.append($$anchor, h1);
		};
		List(node_1, {
			header,
			children: ($$anchor, $$slotProps) => {
				var p = root_2();
				$.append($$anchor, p);
			},
			$$slots: {
				header: true,
				default: true
			}
		});
	}
	$.append($$anchor, fragment);
}
