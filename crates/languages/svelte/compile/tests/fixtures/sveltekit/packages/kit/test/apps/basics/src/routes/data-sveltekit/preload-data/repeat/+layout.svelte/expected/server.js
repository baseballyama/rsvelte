import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;

		$$renderer.push(`<ul><li><a id="home"${$.attr('href', resolve('/data-sveltekit/preload-data/repeat'))}>home</a></li> <li><a id="target"${$.attr('href', resolve('/data-sveltekit/preload-data/repeat/target'))} data-sveltekit-preload-data="hover">target</a></li></ul> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}