import * as $ from 'svelte/internal/server';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

export default function OverflowMenuItem_icons_test($$renderer) {
	OverflowMenu($$renderer, {
		open: true,
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { icon: Edit, iconRight: Launch, text: 'Both icons' });
			$$renderer.push(`<!----> `);

			OverflowMenuItem($$renderer, {
				text: 'Slot icon',
				$$slots: {
					iconRight: ($$renderer) => {
						$$renderer.push(`<svg slot="iconRight" data-testid="slot-icon-right"></svg>`);
					}
				}
			});

			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: 'No icons' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}