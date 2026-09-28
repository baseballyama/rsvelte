import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { ProxyRuleDeploymentResourceType } from '@appwrite.io/console';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			return realtime.forProject(page.params.region, ['console', 'project'], (response) => {
				if (response.events.includes('rules.*.update')) {
					const proxyRule = response.payload;

					if (proxyRule.deploymentResourceType === ProxyRuleDeploymentResourceType.Site && proxyRule.deploymentResourceId === page.params.site) {
						invalidate(Dependencies.SITES_DOMAINS);
					}
				}
			});
		});

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}