import * as $ from 'svelte/internal/server';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

export default function OverflowMenu_allDisabled_test($$renderer) {
	OverflowMenu($$renderer, {
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { disabled: true, text: 'Manage credentials' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { disabled: true, text: 'API documentation' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { disabled: true, text: 'Delete service' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}