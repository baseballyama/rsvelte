import * as $ from 'svelte/internal/server';

import {
	ContextMenu,
	ContextMenuDivider,
	ContextMenuGroup,
	ContextMenuOption
} from "carbon-components-svelte";

export default function ContextMenuSelectableNested($$renderer) {
	let selectedIds = ["guides"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ContextMenu($$renderer, {
			children: ($$renderer) => {
				ContextMenuOption($$renderer, { indented: true, labelText: 'Open' });
				$$renderer.push(`<!----> `);
				ContextMenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				ContextMenuOption($$renderer, {
					indented: true,
					labelText: 'Layers',
					children: ($$renderer) => {
						ContextMenuGroup($$renderer, {
							labelText: 'Visible layers',
							get selectedIds() {
								return selectedIds;
							},

							set selectedIds($$value) {
								selectedIds = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ContextMenuOption($$renderer, { id: 'guides', labelText: 'Guides' });
								$$renderer.push(`<!----> `);
								ContextMenuOption($$renderer, { id: 'grid', labelText: 'Grid' });
								$$renderer.push(`<!----> `);
								ContextMenuOption($$renderer, { id: 'annotations', labelText: 'Annotations' });
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

		$$renderer.push(`<!----> <div data-centered=""><p>Right click anywhere on this page</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}