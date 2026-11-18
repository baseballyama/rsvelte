import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<section><p><!></p></section>`);
var root_2 = $.from_html(`<!> <!>`, 1);
export default function Const_repeated_in_a_snippet_block($$anchor, $$props) {
	var fragment = root_2();
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			const h = $.derived(() => $$props.v);
			var div = root();
			{
				const s = ($$anchor) => {
					$.next();
					var text = $.text();
					$.template_effect(() => $.set_text(text, $.get(h)));
					$.append($$anchor, text);
				};
				const h = $.derived(() => $$props.v);
				var node_1 = $.child(div);
				s(node_1);
				$.reset(div);
			}
			$.append($$anchor, div);
		};
		$.if(node, ($$render) => {
			if ($$props.v) $$render(consequent);
		});
	}
	var node_2 = $.sibling(node, 2);
	{
		var consequent_1 = ($$anchor) => {
			const k = $.derived(() => $$props.v);
			var section = root_1();
			var p = $.child(section);
			{
				const t = ($$anchor) => {
					$.next();
					var text_1 = $.text();
					$.template_effect(() => $.set_text(text_1, $.get(k)));
					$.append($$anchor, text_1);
				};
				const k = $.derived(() => $$props.v);
				var node_3 = $.child(p);
				t(node_3);
				$.reset(p);
			}
			$.reset(section);
			$.append($$anchor, section);
		};
		$.if(node_2, ($$render) => {
			if ($$props.v) $$render(consequent_1);
		});
	}
	$.append($$anchor, fragment);
}
