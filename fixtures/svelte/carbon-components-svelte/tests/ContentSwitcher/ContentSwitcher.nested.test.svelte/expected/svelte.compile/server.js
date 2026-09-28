import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

export default function ContentSwitcher_nested_test($$renderer) {
	ContentSwitcher($$renderer, {
		children: ($$renderer) => {
			Switch($$renderer, { text: 'Outer 1' });
			$$renderer.push(`<!----> `);

			Switch($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span data-testid="nested-tab" role="tab">Nested tab</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Outer 3' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}