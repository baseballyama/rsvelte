import * as $ from 'svelte/internal/server';

import {
	Button,
	Dialog,
	Dropdown,
	OverflowMenu,
	OverflowMenuItem,
	Stack
} from "carbon-components-svelte";

export default function FloatingPortalDialog($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			modal: true,
			'aria-label': 'Region settings',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Stack($$renderer, {
					gap: 5,
					children: ($$renderer) => {
						$$renderer.push(`<p>Carbon components that portal their floating content (dropdowns, overflow
      menus, tooltips, date pickers, etc.) are automatically mounted into the
      nearest <code>&lt;dialog></code> ancestor, so they render above the
      modal backdrop in the top layer.</p> `);

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
							children: ($$renderer) => {
								$$renderer.push(`<!---->Close`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}