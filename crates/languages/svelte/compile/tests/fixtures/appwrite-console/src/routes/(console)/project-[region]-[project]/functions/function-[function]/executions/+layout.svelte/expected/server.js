import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			return realtime.forProject(page.params.region, 'functions.*.executions', (response) => {
				if (response.events.includes('functions.*.executions.*')) {
					invalidate(Dependencies.EXECUTIONS);
				}
			});
		});

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}