import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import List from "./List.svelte";
var root = $.from_html(`<b>snippet</b>`);
var root_1 = $.from_html(`<div><!></div> <p><!></p>`, 1);
var root_2 = $.from_html(`<div><!><i></i></div>`);
var root_3 = $.from_html(`<!> <button> </button> <!> <!>`, 1);
export default function Snippet_shadows($$anchor, $$props) {
	let count = $.state(0);
	let items = $.proxy([1]);
	var fragment = root_3();
	var node = $.first_child(fragment);
	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			{
				const item = ($$anchor) => {
					var b = root();
					$.append($$anchor, b);
				};
				var node_1 = $.child(div);
				item(node_1);
				$.reset(div);
			}
			var p = $.sibling(div, 2);
			{
				const count = ($$anchor) => {
					$.next();
					var text = $.text("x");
					$.append($$anchor, text);
				};
				var node_2 = $.child(p);
				count(node_2);
				$.reset(p);
			}
			$.append($$anchor, fragment_1);
		};
		$.if(node, ($$render) => {
			if ($$props.label) $$render(consequent);
		});
	}
	var button = $.sibling(node, 2);
	var text_1 = $.only_child(button, true);
	var node_3 = $.sibling(button, 2);
	$.each(node_3, 17, () => items, $.index, ($$anchor, row) => {
		var div_1 = root_2();
		{
			const row = ($$anchor) => {
				$.next();
				var text_2 = $.text("r");
				$.append($$anchor, text_2);
			};
			var node_4 = $.child(div_1);
			{
				var consequent_1 = ($$anchor) => {
					row($$anchor);
				};
				$.if(node_4, ($$render) => {
					if ($$props.label) $$render(consequent_1);
				});
			}
			var i = $.sibling(node_4);
			$.reset(div_1);
			$.template_effect(($0) => $.set_attribute(i, "title", $0), [() => String(row)]);
		}
		$.append($$anchor, div_1);
	});
	var node_5 = $.sibling(node_3, 2);
	{
		const label = ($$anchor) => {
			$$props.label?.($$anchor);
		};
		List(node_5, {
			label,
			$$slots: { label: true }
		});
	}
	$.template_effect(() => $.set_text(text_1, $.get(count)));
	$.delegated("click", button, () => $.update(count));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
