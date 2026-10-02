import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContentSwitcher, Switch } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <p data-testid="selected-index"> </p>`, 1);

export default function ContentSwitcherFixture($$anchor) {
	let selectedIndex = 0;
	var fragment = root_1();
	var node = $.first_child(fragment);

	ContentSwitcher(node, {
		'data-testid': 'content-switcher',
		get selectedIndex() {
			return selectedIndex;
		},

		set selectedIndex($$value) {
			selectedIndex = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Switch(node_1, { text: 'First', selected: true });

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { text: 'Second' });

			var node_3 = $.sibling(node_2, 2);

			Switch(node_3, { text: 'Third' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Selected: ${selectedIndex ?? ''}`));
	$.append($$anchor, fragment);
}