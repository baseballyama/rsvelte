import * as $ from 'svelte/internal/server';
import { ComboButton, MenuItem } from "carbon-components-svelte";

export default function ComboButtonFixture($$renderer) {
	let primaryClicks = 0;
	let selectedAction = "";

	ComboButton($$renderer, {
		labelText: 'Save',
		children: ($$renderer) => {
			MenuItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Save as`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			MenuItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Save a copy`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p data-testid="primary-clicks">Primary clicks: ${$.escape(primaryClicks)}</p> `);

	if (selectedAction) {
		$$renderer.push(`<!--[0--><p data-testid="selected-action">Selected: ${$.escape(selectedAction)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}