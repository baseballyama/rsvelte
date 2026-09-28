import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			return realtime.forProject(page.params.region, ['console', 'project'], (response) => {
				if (response.events.includes('rules.*.update')) {
					const proxyRule = response.payload;

					if (proxyRule.type === RuleType.API) {
						invalidate(Dependencies.DOMAINS);
					}
				}
			});
		});

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}