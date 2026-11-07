import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>404</h1> <blockquote class="svelte-1kntfxi"><p>Not Found</p> <p>Take me <a${$.attr('href', resolve('/'))}>home</a></p></blockquote>`);
	});
}