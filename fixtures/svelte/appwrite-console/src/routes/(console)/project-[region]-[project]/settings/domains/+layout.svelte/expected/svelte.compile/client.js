import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}