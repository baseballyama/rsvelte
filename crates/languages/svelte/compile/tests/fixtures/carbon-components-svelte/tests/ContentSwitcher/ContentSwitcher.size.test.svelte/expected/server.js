import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

export default function ContentSwitcher_size_test($$renderer) {
	ContentSwitcher($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			Switch($$renderer, { text: 'Small 1' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Small 2' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ContentSwitcher($$renderer, {
		size: 'xl',
		children: ($$renderer) => {
			Switch($$renderer, { text: 'XL 1' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'XL 2' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}