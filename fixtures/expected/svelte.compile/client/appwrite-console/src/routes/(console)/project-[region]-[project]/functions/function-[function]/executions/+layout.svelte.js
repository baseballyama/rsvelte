import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		return realtime.forProject(page.params.region, 'functions.*.executions', (response) => {
			if (response.events.includes('functions.*.executions.*')) {
				invalidate(Dependencies.EXECUTIONS);
			}
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}