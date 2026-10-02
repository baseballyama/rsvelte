import * as $ from 'svelte/internal/server';
import { reveal } from './data.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let result = 'none';

		$$renderer.push(`<button id="reveal">reveal</button> <p id="result">${$.escape(result)}</p>`);
	});
}