import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ContentSwitcher, Stack, Switch } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div> <div> </div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ContentSwitcherReactive($$anchor) {
	let selectedIndex = 1;
	var fragment = root_2();
	var node = $.first_child(fragment);

	ContentSwitcher(node, {
		get selectedIndex() {
			return selectedIndex;
		},

		set selectedIndex($$value) {
			selectedIndex = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Switch(node_1, { text: 'Latest news' });

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { text: 'Trending' });

			var node_3 = $.sibling(node_2, 2);

			Switch(node_3, { text: 'Recommended' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Stack(node_4, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var div = $.first_child(fragment_2);
			var node_5 = $.child(div);

			{
				let $0 = $.derived(() => selectedIndex === 2);

				Button(node_5, {
					size: 'small',
					get disabled() {
						return $.get($0);
					},
					$$events: { click: () => selectedIndex = 2 },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Set selected to 2');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var text_1 = $.only_child(div_1);

			$.template_effect(() => $.set_text(text_1, `Selected index: ${selectedIndex ?? ''}`));
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}