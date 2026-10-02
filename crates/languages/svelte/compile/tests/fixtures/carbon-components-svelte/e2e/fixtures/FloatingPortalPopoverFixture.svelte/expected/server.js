import * as $ from 'svelte/internal/server';
import { Button, Dropdown, OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

export default function FloatingPortalPopoverFixture($$renderer) {
	let popover = null;

	$$renderer.push(`<button type="button" data-testid="open-popover">Open popover</button> <div data-testid="native-popover" popover="manual" style="width: min(100%, 28rem); padding: 1rem;">`);

	Stack($$renderer, {
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<p>Floating content auto-mounts into the nearest popover ancestor.</p> `);

			Dropdown($$renderer, {
				portalMenu: true,
				labelText: 'Region',
				selectedId: 'us-south',
				items: [
					{ id: "us-south", text: "Dallas" },
					{ id: "us-east", text: "Washington DC" },
					{ id: "eu-de", text: "Frankfurt" },
					{ id: "jp-tok", text: "Tokyo" }
				]
			});

			$$renderer.push(`<!----> `);

			OverflowMenu($$renderer, {
				portalMenu: true,
				children: ($$renderer) => {
					OverflowMenuItem($$renderer, { text: 'Edit' });
					$$renderer.push(`<!----> `);
					OverflowMenuItem($$renderer, { text: 'Duplicate' });
					$$renderer.push(`<!----> `);
					OverflowMenuItem($$renderer, { danger: true, text: 'Delete' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'secondary',
				type: 'button',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Close`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}