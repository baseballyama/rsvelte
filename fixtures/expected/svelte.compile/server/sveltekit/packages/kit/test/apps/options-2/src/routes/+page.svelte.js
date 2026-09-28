import * as $ from 'svelte/internal/server';
import { resolve, asset } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>Hello</h1> <p data-testid="base">base: ${$.escape(resolve(''))}</p> <p data-testid="assets">assets: ${$.escape(asset('answer.txt').replace('answer.txt', ''))}</p> <a${$.attr('href', resolve('/hello'))} data-testid="link" class="svelte-1vpch45">Go to /hello</a>`);
	});
}