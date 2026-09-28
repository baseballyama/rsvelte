import * as $ from 'svelte/internal/server';
import ContainedList from "carbon-components-svelte/ContainedList/ContainedList.svelte";
import ContainedListItem from "carbon-components-svelte/ContainedList/ContainedListItem.svelte";

export default function ContainedList_labelChildren_test($$renderer) {
	ContainedList($$renderer, {
		children: ($$renderer) => {
			ContainedListItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Item 1`);
				},
				$$slots: { default: true }
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

		$$slots: {
			default: true,
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom Slot Label</span>`);
			}
		}
	});
}