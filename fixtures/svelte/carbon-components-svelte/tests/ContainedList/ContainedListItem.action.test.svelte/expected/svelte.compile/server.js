import * as $ from 'svelte/internal/server';
import Button from "carbon-components-svelte/Button/Button.svelte";
import ContainedList from "carbon-components-svelte/ContainedList/ContainedList.svelte";
import ContainedListItem from "carbon-components-svelte/ContainedList/ContainedListItem.svelte";
import Close from "carbon-icons-svelte/lib/Close.svelte";

export default function ContainedListItem_action_test($$renderer) {
	ContainedList($$renderer, {
		labelText: 'List title',
		children: ($$renderer) => {
			ContainedListItem($$renderer, {
				interactive: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Item 1`);
				},

				$$slots: {
					default: true,
					action: ($$renderer) => {
						Button($$renderer, {
							slot: 'action',
							kind: 'ghost',
							icon: Close,
							iconDescription: 'Dismiss'
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			ContainedListItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Item 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}