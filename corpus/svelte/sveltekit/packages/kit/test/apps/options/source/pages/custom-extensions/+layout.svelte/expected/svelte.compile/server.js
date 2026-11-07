import * as $ from 'svelte/internal/server';
import { goto, preloadCode, preloadData } from '$app/navigation';

export default function _layout($$renderer, $$props) {
	if (typeof window !== 'undefined') {
		Object.assign(window, { goto, preloadCode, preloadData });
	}

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <footer>Custom layout</footer>`);
}