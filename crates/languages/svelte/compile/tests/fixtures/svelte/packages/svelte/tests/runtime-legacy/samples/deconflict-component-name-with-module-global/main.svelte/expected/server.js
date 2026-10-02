import * as $ from 'svelte/internal/server';

let set = new Set(['x']);

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p>${$.escape(set.has('x'))}</p>`);
	});
}