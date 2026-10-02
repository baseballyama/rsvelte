import * as $ from 'svelte/internal/server';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";
import Dashboard from "carbon-icons-svelte/lib/Dashboard.svelte";
import TableOfContents from "carbon-icons-svelte/lib/TableOfContents.svelte";

export default function ContentSwitcher_iconOnlyMixed_test($$renderer) {
	ContentSwitcher($$renderer, {
		children: ($$renderer) => {
			Switch($$renderer, { icon: TableOfContents, text: 'Table of contents' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { icon: Dashboard, text: 'Dashboard' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { text: 'Plain' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}