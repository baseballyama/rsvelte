import * as $ from 'svelte/internal/server';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

export default function OverflowMenu_preventDefault_test($$renderer) {
	OverflowMenu($$renderer, {
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { text: 'Manage credentials' });
			$$renderer.push(`<!----> `);

			OverflowMenuItem($$renderer, {
				href: 'https://cloud.ibm.com/docs/api-gateway/',
				text: 'API documentation'
			});

			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { danger: true, text: 'Delete service' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}