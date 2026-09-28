import * as $ from 'svelte/internal/server';
import { commandContext } from '$lib/context';
import { shortcut } from '$lib/actions/shortcut.svelte';
import { Command } from '$lib/components/docs/command';
import { UseBoolean } from '$lib/hooks/use-boolean.svelte';
import SiteHeader from '$lib/components/site-header.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const commandState = commandContext.set(new UseBoolean(false));

		Command($$renderer, {});
		$$renderer.push(`<!----> `);
		SiteHeader($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col items-center"><div class="site-container">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}