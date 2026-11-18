import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(` <!>`, 1);
export default function Const_beside_snippet($$anchor, $$props) {
	$.push($$props, true);
	{
		const prop = ($$anchor) => {
			const foo = $.derived(() => $$props.items[0]);
			$.next();
			var text = $.text();
			$.template_effect(() => $.set_text(text, $.get(foo)));
			$.append($$anchor, text);
		};
		Component($$anchor, {
			prop,
			children: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$props.items.length);
				$.next();
				var fragment_2 = root();
				var text_1 = $.first_child(fragment_2);
				var node = $.sibling(text_1);
				{
					const prop = ($$anchor) => {
						$.next();
						var text_2 = $.text();
						$.template_effect(() => $.set_text(text_2, $.get(foo)));
						$.append($$anchor, text_2);
					};
					Component(node, {
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
	$.pop();
}
