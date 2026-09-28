import * as $ from 'svelte/internal/server';
import ContainedList from "carbon-components-svelte/ContainedList/ContainedList.svelte";
import ContainedListItem from "carbon-components-svelte/ContainedList/ContainedListItem.svelte";

export default function ContainedListItem_href_test($$renderer) {
	function handleClick(event) {
		event.preventDefault();
		console.log("click");
	}

	ContainedList($$renderer, {
		labelText: 'Related resources',
		children: ($$renderer) => {
			ContainedListItem($$renderer, {
				href: '/docs',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Documentation`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ContainedListItem($$renderer, {
				href: '/docs',
				interactive: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Prefer href`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ContainedListItem($$renderer, {
				interactive: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Interactive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ContainedListItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Static`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}