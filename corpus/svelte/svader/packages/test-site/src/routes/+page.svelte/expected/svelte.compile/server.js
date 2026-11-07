import * as $ from 'svelte/internal/server';
import { resolve } from "$app/paths";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<ol><li><a${$.attr('href', resolve("/hello-world"))}>Hello world</a></li> <li><a${$.attr('href', resolve("/remount"))}>Remounting canvas</a></li> <li><a${$.attr('href', resolve("/oversized-canvas"))}>Oversized canvas</a></li> <li><a${$.attr('href', resolve("/landing-page-bubbles"))}>Landing page with bubbles</a></li> <li><a${$.attr('href', resolve("/landing-page-halo"))}>Landing page with a halo</a></li> <li><a${$.attr('href', resolve("/slider"))}>Slider component</a></li></ol>`);
	});
}