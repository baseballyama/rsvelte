import * as $ from 'svelte/internal/server';
import { asset } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<img alt="Minified Size"${$.attr('src', asset('/minified-size-badge.svg'))}/> <p>The badge above shows the minimized size of the library when all features are used. <br/> Please note, the size includes type definitions, styles and components.</p>`);
	});
}