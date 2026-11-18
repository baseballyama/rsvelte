import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);
var root_1 = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!> <!> <div><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper></div>`, 1);
export default function Css_props_standalone($$anchor, $$props) {
	let show = $.prop($$props, "show", 3, true), w = $.prop($$props, "w", 3, 1);
	let items = $.proxy([1]);
	var fragment = root_1();
	var node = $.first_child(fragment);
	{
		$.css_props(node, () => ({ "--w": `${w() ?? ""}px` }));
		C(node.lastChild, {});
		$.reset(node);
	}
	var node_1 = $.sibling(node, 2);
	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);
			{
				$.css_props(node_2, () => ({ "--a": items.length }));
				C(node_2.lastChild, {});
				$.reset(node_2);
			}
			$.append($$anchor, fragment_1);
		};
		$.if(node_1, ($$render) => {
			if (show()) $$render(consequent);
		});
	}
	var node_3 = $.sibling(node_1, 2);
	$.each(node_3, 17, () => items, $.index, ($$anchor, item) => {
		var fragment_2 = root();
		var node_4 = $.first_child(fragment_2);
		{
			$.css_props(node_4, () => ({ "--b": $.get(item) }));
			C(node_4.lastChild, {
				get c() {
					return $.get(item);
				},
				children: ($$anchor, $$slotProps) => {
					$.next();
					var text = $.text();
					$.template_effect(() => $.set_text(text, $.get(item)));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
			$.reset(node_4);
		}
		$.append($$anchor, fragment_2);
	});
	var div = $.sibling(node_3, 2);
	var node_5 = $.child(div);
	{
		let $0 = $.derived(() => Math.max(w(), 2));
		$.css_props(node_5, () => ({ "--x": $.get($0) }));
		C(node_5.lastChild, {});
		$.reset(node_5);
	}
	$.reset(div);
	$.append($$anchor, fragment);
}
