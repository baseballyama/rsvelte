import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function CrossfadeBoundary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext('crossfade', null);
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}