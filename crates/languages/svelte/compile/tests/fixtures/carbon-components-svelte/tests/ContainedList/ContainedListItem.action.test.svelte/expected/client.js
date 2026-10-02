import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import ContainedList from "carbon-components-svelte/ContainedList/ContainedList.svelte";
import ContainedListItem from "carbon-components-svelte/ContainedList/ContainedListItem.svelte";
import Close from "carbon-icons-svelte/lib/Close.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ContainedListItem_action_test($$anchor) {
	ContainedList($$anchor, {
		labelText: 'List title',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ContainedListItem(node, {
				interactive: true,
				$$events: { click: () => console.log("item click") },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Item 1');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					action: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							slot: 'action',
							kind: 'ghost',
							get icon() {
								return Close;
							},
							iconDescription: 'Dismiss',
							$$events: { click: () => console.log("action click") }
						});
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			ContainedListItem(node_1, {
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
}