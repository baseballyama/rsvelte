import * as $ from 'svelte/internal/server';

import {
	ContextMenu,
	ContextMenuDivider,
	ContextMenuOption,
	ContextMenuRadioGroup
} from "carbon-components-svelte";

export default function ContextMenuRadioGroupNested($$renderer) {
	let selectedId = "list";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ContextMenu($$renderer, {
			children: ($$renderer) => {
				ContextMenuOption($$renderer, { labelText: 'Open' });
				$$renderer.push(`<!----> `);
				ContextMenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				ContextMenuOption($$renderer, {
					labelText: 'View as',
					children: ($$renderer) => {
						ContextMenuRadioGroup($$renderer, {
							labelText: 'View mode',
							get selectedId() {
								return selectedId;
							},

							set selectedId($$value) {
								selectedId = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ContextMenuOption($$renderer, { id: 'list', labelText: 'List' });
								$$renderer.push(`<!----> `);
								ContextMenuOption($$renderer, { id: 'grid', labelText: 'Grid' });
								$$renderer.push(`<!----> `);
								ContextMenuOption($$renderer, { id: 'compact', labelText: 'Compact' });
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