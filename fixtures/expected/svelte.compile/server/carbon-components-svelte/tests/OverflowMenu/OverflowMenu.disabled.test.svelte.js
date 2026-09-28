import * as $ from 'svelte/internal/server';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

export default function OverflowMenu_disabled_test($$renderer) {
	OverflowMenu($$renderer, {
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { text: 'First' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { disabled: true, text: 'Second (disabled)' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: 'Third' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { disabled: true, text: 'Fourth (disabled)' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}