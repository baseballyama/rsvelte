import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let tag = 'path';
	let xmlns = 'http://www.w3.org/2000/svg';

	$$renderer.push(`<button>change</button> <svg>`);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr('xmlns', xmlns)}`);
	});

	$$renderer.push(`</svg>`);
}