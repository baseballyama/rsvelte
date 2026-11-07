import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

export default function ContentSwitcher_custom_test($$renderer) {
	ContentSwitcher($$renderer, {
		children: ($$renderer) => {
			Switch($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div data-testid="custom-content">Custom Content</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Regular Text' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}