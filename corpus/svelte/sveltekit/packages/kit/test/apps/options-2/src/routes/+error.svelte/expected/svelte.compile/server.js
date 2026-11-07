import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { resolve, asset } from '$app/paths';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1 data-testid="error-status">${$.escape(page.status)}</h1> <p data-testid="base">base: ${$.escape(resolve(''))}</p> <p data-testid="assets">assets: ${$.escape(asset('answer.txt').replace('answer.txt', ''))}</p>`);
	});
}