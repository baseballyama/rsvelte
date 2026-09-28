import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = 'lazy';

		$$renderer.push(`<img alt="Svelte" src="foo.png"${$.attr('loading', loading)}/>`);
	});
}