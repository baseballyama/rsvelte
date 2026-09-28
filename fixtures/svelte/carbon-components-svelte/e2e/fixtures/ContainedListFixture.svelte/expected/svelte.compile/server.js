import * as $ from 'svelte/internal/server';
import { ContainedList, ContainedListItem } from "carbon-components-svelte";

export default function ContainedListFixture($$renderer) {
	let clickedItem = null;

	$$renderer.push(`<div data-testid="contained-list">`);

	ContainedList($$renderer, {
		labelText: 'List title',
		children: ($$renderer) => {
			ContainedListItem($$renderer, {
				interactive: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Item 1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ContainedListItem($$renderer, {
				interactive: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Item 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="clicked-item">${$.escape(clickedItem ?? "none")}</div>`);
}