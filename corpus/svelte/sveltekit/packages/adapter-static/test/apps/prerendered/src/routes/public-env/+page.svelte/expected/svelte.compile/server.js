import * as $ from 'svelte/internal/server';
import { browser } from '$app/env';
import { PUBLIC_ANSWER } from '$app/env/public';

export default function _page($$renderer) {
	$$renderer.push(`<h1>The answer is ${$.escape(PUBLIC_ANSWER)}</h1> `);

	if (browser) {
		$$renderer.push(`<!--[0--><h2>The dynamic answer is ${$.escape(PUBLIC_ANSWER)}</h2>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}