import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

export default function ContentSwitcher_disabled_test($$renderer) {
	ContentSwitcher($$renderer, {
		children: ($$renderer) => {
			Switch($$renderer, { text: 'Enabled' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Disabled', disabled: true });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Also Enabled' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}