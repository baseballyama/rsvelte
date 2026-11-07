import * as $ from 'svelte/internal/server';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

export default function OverflowMenuPrimaryFocus_test($$renderer) {
	OverflowMenu($$renderer, {
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { text: 'Manage credentials' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { primaryFocus: true, text: 'API documentation' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: 'Delete service' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}