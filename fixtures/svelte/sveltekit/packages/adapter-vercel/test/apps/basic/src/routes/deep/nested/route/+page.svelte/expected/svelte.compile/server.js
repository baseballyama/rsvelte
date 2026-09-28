import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<h1>Deep nested route</h1> <p id="depth">${$.escape(data.depth)}</p> <p id="path">${$.escape(data.path)}</p>`);
	});
}