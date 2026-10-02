import * as $ from 'svelte/internal/server';
import Header from '$lib/Header.svelte';
import '../app.css';

export default function _layout($$renderer, $$props) {
	if (typeof window !== 'undefined') {
		window.process = { cwd: () => '/' };
	}

	Header($$renderer, {});
	$$renderer.push(`<!----> <main class="main svelte-1sjlofm"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></main>`);
}