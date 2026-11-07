import * as $ from 'svelte/internal/server';
import { asset, resolve } from '$app/paths';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const origin = page.url.origin;

		$$renderer.push(`<h1>Welcome to Svelte-Splitpane demo!</h1> <a href="https://github.com/orefalo/svelte-splitpanes">https://github.com/orefalo/svelte-splitpanes</a> <h2>Features</h2> <a${$.attr('href', origin + resolve('/minified-size'))}><img alt="Minified Size"${$.attr('src', origin + asset('/minified-size-badge.svg'))}/></a> <ul><li>Support both dynamic horizontal and vertical splits</li> <li>Support defaults, min and max sizes</li> <li>Support multiple splits</li> <li>Support lifecyle events</li> <li>Support custom divider size or overlay</li> <li>Support splitter pane pushing</li> <li>Support RTL rendering with auto-detection</li> <li>Support first splitter on/off</li> <li>Support pane toggle</li> <li>Support edge snapping</li> <li>Support programmatic resizing and two-way size binding</li> <li>Support programmatic panes add/remove</li> <li>Support programmatic panes reordering by Svelte keyed each blocks</li> <li>Support for legacy browser such as IE 11</li> <li>Support for touch devices</li> <li>Sveltekit &amp; Typescript friendly</li></ul>`);
	});
}