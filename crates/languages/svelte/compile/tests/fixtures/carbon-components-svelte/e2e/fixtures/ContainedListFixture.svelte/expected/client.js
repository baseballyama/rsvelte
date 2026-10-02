import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContainedList, ContainedListItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="contained-list"><!></div> <div data-testid="clicked-item"> </div>`, 1);

export default function ContainedListFixture($$anchor) {
	let clickedItem = null;
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	ContainedList(node, {
		labelText: 'List title',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ContainedListItem(node_1, {
				interactive: true,
				$$events: { click: () => clickedItem = "1" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Item 1');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ContainedListItem(node_2, {
				interactive: true,
				$$events: { click: () => clickedItem = "2" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Item 2');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var text_2 = $.only_child(div_1, true);

	$.template_effect(() => $.set_text(text_2, clickedItem ?? "none"));
	$.append($$anchor, fragment);
}