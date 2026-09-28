import * as $ from 'svelte/internal/server';
import { DocsLayout } from "@svecodocs/kit";
import { navigation } from "$lib/navigation";
import ModeWatcherDark from "$lib/components/logos/mode-watcher-dark.svelte";
import ModeWatcherLight from "$lib/components/logos/mode-watcher-light.svelte";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	{
		function logo($$renderer) {
			ModeWatcherDark($$renderer, { class: 'hidden max-h-6 dark:block' });
			$$renderer.push(`<!----> `);
			ModeWatcherLight($$renderer, { class: 'block max-h-6 dark:hidden' });
			$$renderer.push(`<!----> <span class="sr-only">Svecodocs</span>`);
		}

		DocsLayout($$renderer, {
			navigation,
			logo,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { logo: true, default: true }
		});
	}
}