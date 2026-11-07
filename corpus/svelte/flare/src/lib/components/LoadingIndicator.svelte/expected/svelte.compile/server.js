import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function LoadingIndicator($$renderer, $$props) {
	let { isLoading } = $$props;

	$$renderer.push(`<div class="bg-muted absolute right-0 bottom-0 left-0 h-px"></div> `);

	if (isLoading) {
		$$renderer.push(`<!--[0--><div class="loading-indicator" data-testid="loading-indicator"></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}