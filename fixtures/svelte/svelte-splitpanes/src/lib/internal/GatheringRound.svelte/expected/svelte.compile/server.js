import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export const gatheringKey = {};

export default function GatheringRound($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext(gatheringKey, true);
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}