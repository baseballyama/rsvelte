import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let set = new Set(['x']);

		$$renderer.push(`<p>${$.escape(set.has('x'))}</p>`);
	});
}