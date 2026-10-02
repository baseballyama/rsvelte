import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p data-testid="selected-action"> </p>`);
var root_2 = $.from_html(`<div data-testid="outside-area" class="outside-click-area svelte-oxrb60">Click here to close menu</div> <!> <!>`, 1);

export default function OverflowMenuFixture($$anchor) {
	let selectedAction = "";
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	OverflowMenu(node, {
		'data-testid': 'overflow-menu',
		'aria-label': 'Actions',
		iconDescription: 'Open menu',
		$$events: {
			close: ({ detail }) => {
				if (detail?.text) selectedAction = detail.text;
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			OverflowMenuItem(node_1, { text: 'Action 1' });

			var node_2 = $.sibling(node_1, 2);

			OverflowMenuItem(node_2, { text: 'Action 2' });

			var node_3 = $.sibling(node_2, 2);

			OverflowMenuItem(node_3, { text: 'Action 3' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `Selected: ${selectedAction ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node_4, ($$render) => {
			if (selectedAction) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}