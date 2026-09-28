import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h3>navigation test finish</h3> <p>active: ${$.escape(page.state.active ?? false)}</p>`);
	});
}