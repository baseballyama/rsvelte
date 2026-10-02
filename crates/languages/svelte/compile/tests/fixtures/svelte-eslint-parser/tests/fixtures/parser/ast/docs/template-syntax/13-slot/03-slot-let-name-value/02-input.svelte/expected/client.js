import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li class="fancy"><!></li>`);
var root_1 = $.from_html(`<div slot="item"> </div>`);
var root_2 = $.from_html(`<p slot="footer">Copyright (c) 2019 Svelte Industries</p>`);
var root_3 = $.from_html(`<ul></ul> <!> <!>`, 1);

export default function _2_input($$anchor, $$props) {
	var fragment = root_3();
	var ul = $.first_child(fragment);

	$.each(ul, 20, () => items, $.index, ($$anchor, item) => {
		var li = root();
		var node = $.child(li);

		$.slot(
			node,
			$$props,
			'item',
			{
				get item() {
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

	$.slot(node_1, $$props, 'footer', {}, null);

	var node_2 = $.sibling(node_1, 2);

	FancyList(node_2, {
		items,
		$$slots: {
			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				var div = root_1();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(item).text));
				$.append($$anchor, div);
			},

			footer: ($$anchor, $$slotProps) => {
				var p = root_2();

				$.append($$anchor, p);
			}
		}
	});

	$.append($$anchor, fragment);
}