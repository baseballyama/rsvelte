import * as $ from 'svelte/internal/server';
import logo from './logo.png?enhanced';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// see https://github.com/sveltejs/kit/issues/15616
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const rawImports = import.meta.glob('./image.svelte', { eager: true, query: '?raw' });

		$$renderer.push(`<enhanced:img id="birds" src="./birds.jpg" alt="birds"></enhanced:img> <enhanced:img id="playwright" src="./playwright-logo.svg" alt="Playwright logo"></enhanced:img> <enhanced:img id="logo"${$.attr('src', logo)} alt="Svelte logo"></enhanced:img>`);
	});
}