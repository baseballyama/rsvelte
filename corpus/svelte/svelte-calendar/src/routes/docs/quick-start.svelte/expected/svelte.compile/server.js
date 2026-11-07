import * as $ from 'svelte/internal/server';
import Code from '$lib/docs/Code.svelte';
import DocPage from '$lib/docs/DocPage.svelte';
import { base } from '$app/paths';

export const ssr = false;

export default function Quick_start($$renderer) {
	// @example(quickStart, QuickStart.svelte)
	const x = 10;

	DocPage($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<ol class="svelte-1tle3nc"><li><h3 class="svelte-1tle3nc">Install with NPM or Yarn</h3> `);
			Code($$renderer, { source: 'npm i -D svelte-calendar' });
			$$renderer.push(`<!----></li> <li><h3 class="svelte-1tle3nc">Import and implement the datepicker</h3> `);
			Code($$renderer, { pretranslated: quickStart.code });

			$$renderer.push(`<!----></li> <li><h3 class="svelte-1tle3nc">See <a${$.attr('href', `${$.stringify(base)}/docs/props`)} class="svelte-1tle3nc">props</a> &amp; <a${$.attr('href', `${$.stringify(base)}/docs/examples`)} class="svelte-1tle3nc">examples</a> for
				more information</h3></li></ol>`);
		},

		$$slots: {
			default: true,
			title: ($$renderer) => {
				{
					$$renderer.push(`Quick-Start`);
				}
			}
		}
	});
}