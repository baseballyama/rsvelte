import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tile from "carbon-components-svelte/Tile/Tile.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Tile_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Tile(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default tile');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tile(node_1, {
		light: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Light variant');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Tile(node_2, {
		'data-testid': 'click-test',
		$$events: {
			click: () => {
				console.log("clicked");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Clickable tile');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tile(node_3, {
		'data-testid': 'attr-test',
		title: 'Custom title',
		class: 'custom-class',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Custom attributes');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}