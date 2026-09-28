import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContainedList from "carbon-components-svelte/ContainedList/ContainedList.svelte";
import ContainedListItem from "carbon-components-svelte/ContainedList/ContainedListItem.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ContainedListItem_href_test($$anchor) {
	function handleClick(event) {
		event.preventDefault();
		console.log("click");
	}

	ContainedList($$anchor, {
		labelText: 'Related resources',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ContainedListItem(node, {
				href: '/docs',
				$$events: { click: handleClick },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Documentation');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			ContainedListItem(node_1, {
				href: '/docs',
				interactive: true,
				$$events: { click: handleClick },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Prefer href');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ContainedListItem(node_2, {
				interactive: true,
				$$events: { click: () => console.log("click") },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Interactive');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			ContainedListItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Static');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}