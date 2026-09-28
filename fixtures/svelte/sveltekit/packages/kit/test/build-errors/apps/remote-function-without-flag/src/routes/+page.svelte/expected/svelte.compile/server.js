import * as $ from 'svelte/internal/server';
import { greet } from './data.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${$.escape(greet())}</h1>`);
	});
}