import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { ProxyRuleDeploymentResourceType } from '@appwrite.io/console';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		return realtime.forProject(page.params.region, ['console', 'project'], (response) => {
			if (response.events.includes('rules.*.update')) {
				const proxyRule = response.payload;

				if (proxyRule.deploymentResourceType === ProxyRuleDeploymentResourceType.Function && proxyRule.deploymentResourceId === page.params.function) {
					invalidate(Dependencies.FUNCTION_DOMAINS);
				}
			}
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}