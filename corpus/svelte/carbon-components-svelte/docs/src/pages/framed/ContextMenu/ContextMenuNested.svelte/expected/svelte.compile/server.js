import * as $ from 'svelte/internal/server';

import {
	ContextMenu,
	ContextMenuDivider,
	ContextMenuGroup,
	ContextMenuOption
} from "carbon-components-svelte";

import CopyFile from "carbon-icons-svelte/lib/CopyFile.svelte";
import Cut from "carbon-icons-svelte/lib/Cut.svelte";

export default function ContextMenuNested($$renderer) {
	let selectedIds = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ContextMenu($$renderer, {
			children: ($$renderer) => {
				ContextMenuOption($$renderer, { labelText: 'Copy', shortcutText: '⌘C', icon: CopyFile });
				$$renderer.push(`<!----> `);
				ContextMenuOption($$renderer, { labelText: 'Cut', shortcutText: '⌘X', icon: Cut });
				$$renderer.push(`<!----> `);
				ContextMenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				ContextMenuOption($$renderer, {
					indented: true,
					labelText: 'Open with',
					children: ($$renderer) => {
						ContextMenuOption($$renderer, { labelText: 'Preview' });
						$$renderer.push(`<!----> `);
						ContextMenuOption($$renderer, { labelText: 'Editor' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				ContextMenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				ContextMenuOption($$renderer, {
					indented: true,
					labelText: 'Export as',
					children: ($$renderer) => {
						ContextMenuGroup($$renderer, {
							labelText: 'Export formats',
							get selectedIds() {
								return selectedIds;
							},

							set selectedIds($$value) {
								selectedIds = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ContextMenuOption($$renderer, { id: 'pdf', labelText: 'PDF' });
								$$renderer.push(`<!----> `);
								ContextMenuOption($$renderer, { id: 'svg', labelText: 'SVG' });
								$$renderer.push(`<!----> `);
								ContextMenuOption($$renderer, { id: 'png', labelText: 'PNG' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				ContextMenuDivider($$renderer, {});
				$$renderer.push(`<!----> `);

				ContextMenuOption($$renderer, {
					disabled: true,
					indented: true,
					labelText: 'Share',
					children: ($$renderer) => {
						ContextMenuOption($$renderer, { labelText: 'Email link' });
						$$renderer.push(`<!----> `);
						ContextMenuOption($$renderer, { labelText: 'Copy link' });
						$$renderer.push(`<!---->`);
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