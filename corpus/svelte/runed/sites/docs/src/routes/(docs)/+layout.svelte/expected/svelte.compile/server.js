import * as $ from 'svelte/internal/server';
import RunedDark from "$lib/components/logos/runed-dark.svelte";
import RunedLight from "$lib/components/logos/runed-light.svelte";
import { DocsLayout } from "@svecodocs/kit";
import { navigation } from "$lib/config/navigation";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	{
		function logo($$renderer) {
			RunedDark($$renderer, { class: 'hidden w-7 dark:block' });
			$$renderer.push(`<!----> `);
			RunedLight($$renderer, { class: 'block w-7 dark:hidden' });
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