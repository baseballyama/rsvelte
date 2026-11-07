import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<button id="reload-button">Reload</button>`);
	});
}