import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
export default function Const_beside_snippet($$anchor, $$props) {
	$.push($$props, true);
	var fragment = root_1();
	var node = $.first_child(fragment);
	{
		const prop = ($$anchor) => {
			const foo = $.derived(() => $$props.items[0]);
			$.next();
			var text = $.text();
			$.template_effect(() => $.set_text(text, $.get(foo)));
			$.append($$anchor, text);
		};
		Component(node, {
			prop,
			children: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$props.items.length);
				$.next();
				var fragment_2 = root();
				var text_1 = $.first_child(fragment_2);
				var node_1 = $.sibling(text_1);
				{
					const prop = ($$anchor) => {
						$.next();
						var text_2 = $.text();
						$.template_effect(() => $.set_text(text_2, $.get(foo)));
						$.append($$anchor, text_2);
					};
					Component(node_1, {
						prop,
						$$slots: { prop: true }
					});
				}
				$.template_effect(() => $.set_text(text_1, `${$.get(foo) ?? ""} `));
				$.append($$anchor, fragment_2);
			},
			$$slots: {
				prop: true,
				default: true
			}
		});
	}
	var node_2 = $.sibling(node, 2);
	{
		const prop = ($$anchor) => {
			$.next();
			var text_3 = $.text();
			text_3.nodeValue = "bar";
			$.append($$anchor, text_3);
		};
		Component(node_2, {
			prop,
			children: ($$anchor, $$slotProps) => {
				const bar = $.derived(() => "bar");
			},
			$$slots: {
				prop: true,
				default: true
			}
		});
	}
	$.append($$anchor, fragment);
	$.pop();
}
