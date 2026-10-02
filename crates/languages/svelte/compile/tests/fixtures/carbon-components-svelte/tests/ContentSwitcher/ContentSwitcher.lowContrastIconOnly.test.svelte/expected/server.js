import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";
import Dashboard from "carbon-icons-svelte/lib/Dashboard.svelte";
import List from "carbon-icons-svelte/lib/List.svelte";
import TableOfContents from "carbon-icons-svelte/lib/TableOfContents.svelte";

export default function ContentSwitcher_lowContrastIconOnly_test($$renderer) {
	ContentSwitcher($$renderer, {
		lowContrast: true,
		children: ($$renderer) => {
			Switch($$renderer, { icon: TableOfContents, text: 'Table of contents' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { icon: Dashboard, text: 'Dashboard' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { icon: List, text: 'List' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}