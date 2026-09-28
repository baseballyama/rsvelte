import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let result = '';

		$$renderer.push(`<p>${$.escape(result)}</p> <button>get</button> <button>post</button>`);
	});
}