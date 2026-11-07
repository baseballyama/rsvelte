import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

export default function ContentSwitcher_lowContrast_test($$renderer) {
	ContentSwitcher($$renderer, {
		lowContrast: true,
		children: ($$renderer) => {
			Switch($$renderer, { text: 'Low 1' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Low 2' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ContentSwitcher($$renderer, {
		children: ($$renderer) => {
			Switch($$renderer, { text: 'Default 1' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Default 2' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}