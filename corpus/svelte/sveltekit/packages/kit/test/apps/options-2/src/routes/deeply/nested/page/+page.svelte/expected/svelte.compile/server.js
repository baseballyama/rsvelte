import * as $ from 'svelte/internal/server';
import { resolve, asset } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>Hello</h1> <p data-testid="base" class="svelte-6rnzaz">base: ${$.escape(resolve(''))}</p> <p data-testid="assets" class="svelte-6rnzaz">assets: ${$.escape(asset('answer.txt').replace('answer.txt', ''))}</p>`);
	});
}