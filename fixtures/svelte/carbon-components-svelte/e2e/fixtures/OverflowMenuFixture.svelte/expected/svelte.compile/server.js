import * as $ from 'svelte/internal/server';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

export default function OverflowMenuFixture($$renderer) {
	let selectedAction = "";

	$$renderer.push(`<div data-testid="outside-area" class="outside-click-area svelte-oxrb60">Click here to close menu</div> `);

	OverflowMenu($$renderer, {
		'data-testid': 'overflow-menu',
		'aria-label': 'Actions',
		iconDescription: 'Open menu',
		children: ($$renderer) => {
			OverflowMenuItem($$renderer, { text: 'Action 1' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: 'Action 2' });
			$$renderer.push(`<!----> `);
			OverflowMenuItem($$renderer, { text: 'Action 3' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (selectedAction) {
		$$renderer.push(`<!--[0--><p data-testid="selected-action">Selected: ${$.escape(selectedAction)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}