import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioTile, TileGroup } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div data-testid="selected-value"> </div>`, 1);

export default function RadioTileFixture($$anchor) {
	let selected = undefined;
	var fragment = root_1();
	var node = $.first_child(fragment);

	TileGroup(node, {
		'data-testid': 'radio-tile-group',
		legendText: 'Choose one',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			RadioTile(node_1, {
				value: 'a',
				'data-testid': 'radio-tile-a',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Option A');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			RadioTile(node_2, {
				value: 'b',
				'data-testid': 'radio-tile-b',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Option B');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var text_2 = $.only_child(div, true);

	$.template_effect(() => $.set_text(text_2, selected ?? "none"));
	$.append($$anchor, fragment);
}