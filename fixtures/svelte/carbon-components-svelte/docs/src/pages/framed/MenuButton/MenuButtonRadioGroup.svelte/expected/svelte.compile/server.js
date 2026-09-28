import * as $ from 'svelte/internal/server';
import { MenuButton, MenuDivider, MenuItem, MenuItemRadioGroup, Stack } from "carbon-components-svelte";

export default function MenuButtonRadioGroup($$renderer) {
	let selectedId = "comfortable";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				MenuButton($$renderer, {
					labelText: 'View',
					children: ($$renderer) => {
						MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Reset`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						MenuDivider($$renderer, {});
						$$renderer.push(`<!----> `);

						MenuItemRadioGroup($$renderer, {
							labelText: 'Density',
							get selectedId() {
								return selectedId;
							},

							set selectedId($$value) {
								selectedId = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								MenuItem($$renderer, { id: 'compact', labelText: 'Compact' });
								$$renderer.push(`<!----> `);
								MenuItem($$renderer, { id: 'comfortable', labelText: 'Comfortable' });
								$$renderer.push(`<!----> `);
								MenuItem($$renderer, { id: 'spacious', labelText: 'Spacious' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p>Density: ${$.escape(selectedId)}</p>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}