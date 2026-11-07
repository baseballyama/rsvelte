import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li class="fancy"><!></li>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<ul></ul> <!>`, 1);

export default function _1_input($$anchor, $$props) {
	var fragment = root_2();
	var ul = $.first_child(fragment);

	$.each(ul, 20, () => items, $.index, ($$anchor, item) => {
		var li = root();
		var node = $.child(li);

		$.slot(
			node,
			$$props,
			'default',
			{
				get prop() {
					return item;
				}
			},
			null
		);

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);

	var node_1 = $.sibling(ul, 2);

	FancyList(node_1, {
		items,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.prop);
				var div = root_1();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(thing).text));
				$.append($$anchor, div);
			}
		}
	});

	$.append($$anchor, fragment);
}