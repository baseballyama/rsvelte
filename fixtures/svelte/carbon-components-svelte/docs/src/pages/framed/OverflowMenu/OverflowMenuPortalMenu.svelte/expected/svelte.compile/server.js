import * as $ from 'svelte/internal/server';
import { OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

export default function OverflowMenuPortalMenu($$renderer) {
	Stack($$renderer, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 120px;',
		children: ($$renderer) => {
			$$renderer.push(`<div>This container has hidden overflow. Without <code>portalMenu</code>, the
    menu would be clipped.</div> `);

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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}