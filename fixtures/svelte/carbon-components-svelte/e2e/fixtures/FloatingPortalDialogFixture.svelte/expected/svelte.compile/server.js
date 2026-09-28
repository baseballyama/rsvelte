import * as $ from 'svelte/internal/server';
import { Button, Dropdown, OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

export default function FloatingPortalDialogFixture($$renderer) {
	let dialog = null;

	$$renderer.push(`<button type="button" data-testid="open-dialog">Open dialog</button> <dialog data-testid="native-dialog">`);

	Stack($$renderer, {
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<p>Floating content auto-mounts into the nearest dialog ancestor.</p> `);

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
				children: ($$renderer) => {
					$$renderer.push(`<!---->Close`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></dialog>`);
}