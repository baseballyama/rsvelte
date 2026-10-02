import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectableTile, SelectableTileGroup } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div data-testid="selected-values"> </div>`, 1);

export default function SelectableTileFixture($$anchor) {
	let selected = [];
	var fragment = root_1();
	var node = $.first_child(fragment);

	SelectableTileGroup(node, {
		'data-testid': 'selectable-tile-group',
		legendText: 'Choose one or more',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			SelectableTile(node_1, {
				value: 'x',
				'data-testid': 'selectable-tile-x',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Option X');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			SelectableTile(node_2, {
				value: 'y',
				'data-testid': 'selectable-tile-y',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Option Y');

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

	$.template_effect(($0) => $.set_text(text_2, $0), [() => selected.join(",") || "none"]);
	$.append($$anchor, fragment);
}