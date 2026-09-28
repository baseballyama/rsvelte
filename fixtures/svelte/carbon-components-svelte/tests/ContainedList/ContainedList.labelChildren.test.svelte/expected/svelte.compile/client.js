import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContainedList from "carbon-components-svelte/ContainedList/ContainedList.svelte";
import ContainedListItem from "carbon-components-svelte/ContainedList/ContainedListItem.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span slot="labelChildren">Custom Slot Label</span>`);

export default function ContainedList_labelChildren_test($$anchor) {
	ContainedList($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ContainedListItem(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Item 1');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
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

		$$slots: {
			default: true,
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root_1();

				$.append($$anchor, span);
			}
		}
	});
}