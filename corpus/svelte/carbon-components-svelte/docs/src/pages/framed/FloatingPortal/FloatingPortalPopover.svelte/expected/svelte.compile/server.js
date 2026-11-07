import * as $ from 'svelte/internal/server';
import { Button, Dropdown, OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

export default function FloatingPortalPopover($$renderer) {
	let popover = null;

	Button($$renderer, {
		type: 'button',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Open popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div popover="manual" style="width: min(100%, 28rem); padding: 1rem; border: 1px dashed var(--cds-border-subtle);">`);

	Stack($$renderer, {
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<p>With the same default <code>target</code> resolution as inside a <code>&lt;dialog></code>, portalled menus mount into this <code>[popover]</code> element so they stay in the popover top layer.</p> `);

			Dropdown($$renderer, {
				portalMenu: true,
				titleText: 'Region',
				selectedId: 'us-south',
				items: [
					{ id: "us-south", text: "Dallas (us-south)" },
					{ id: "us-east", text: "Washington DC (us-east)" },
					{ id: "eu-de", text: "Frankfurt (eu-de)" },
					{ id: "jp-tok", text: "Tokyo (jp-tok)" },
					{ id: "br-sao", text: "São Paulo (br-sao)" },
					{ id: "au-syd", text: "Sydney (au-syd)" },
					{ id: "ca-tor", text: "Toronto (ca-tor)" },
					{ id: "de-fra", text: "Frankfurt (de-fra)" },
					{ id: "es-mad", text: "Madrid (es-mad)" },
					{ id: "fr-par", text: "Paris (fr-par)" },
					{ id: "in-mum", text: "Mumbai (in-mum)" },
					{ id: "it-mil", text: "Milan (it-mil)" },
					{ id: "jp-osa", text: "Osaka (jp-osa)" }
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