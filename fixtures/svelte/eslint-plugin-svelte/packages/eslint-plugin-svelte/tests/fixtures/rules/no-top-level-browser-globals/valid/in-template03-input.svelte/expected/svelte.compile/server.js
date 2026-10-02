import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';

export default function In_template03_input($$renderer) {
	if (!browser) {
		$$renderer.push(`<!--[0-->Server-side.`);
	} else {
		$$renderer.push(`<!--[-1-->${$.escape(location.href)}`);
	}

	$$renderer.push(`<!--]-->`);
}