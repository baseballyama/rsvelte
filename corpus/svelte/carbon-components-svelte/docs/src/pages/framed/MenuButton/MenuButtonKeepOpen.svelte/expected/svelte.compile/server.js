import * as $ from 'svelte/internal/server';

import {
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuItemGroup,
	MenuItemRadioGroup,
	Stack
} from "carbon-components-svelte";

export default function MenuButtonKeepOpen($$renderer) {
	let selectedIds = ["name"];
	let theme = "light";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				MenuButton($$renderer, {
					labelText: 'View',
					children: ($$renderer) => {
						MenuItemGroup($$renderer, {
							labelText: 'Columns',
							get selectedIds() {
								return selectedIds;
							},

							set selectedIds($$value) {
								selectedIds = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								MenuItem($$renderer, { id: 'name', labelText: 'Name' });
								$$renderer.push(`<!----> `);
								MenuItem($$renderer, { id: 'size', labelText: 'Size' });
								$$renderer.push(`<!----> `);
								MenuItem($$renderer, { id: 'modified', labelText: 'Last modified' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						MenuDivider($$renderer, {});
						$$renderer.push(`<!----> `);

						MenuItem($$renderer, {
							labelText: 'Theme',
							children: ($$renderer) => {
								MenuItemRadioGroup($$renderer, {
									get selectedId() {
										return theme;
									},

									set selectedId($$value) {
										theme = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										MenuItem($$renderer, { id: 'light', labelText: 'Light' });
										$$renderer.push(`<!----> `);
										MenuItem($$renderer, { id: 'dark', labelText: 'Dark' });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p>Visible columns: ${$.escape(selectedIds.join(", ") || "None")}</p> <p>Theme: ${$.escape(theme)}</p>`);
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