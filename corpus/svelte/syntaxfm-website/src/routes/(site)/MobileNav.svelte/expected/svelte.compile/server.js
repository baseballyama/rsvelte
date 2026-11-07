import * as $ from 'svelte/internal/server';
import white_grit from '$assets/whitegrit.png';
import { fly } from 'svelte/transition';

export default function MobileNav($$renderer) {
	let is_active = false;

	function toggle() {
		return is_active = !is_active;
	}

	$$renderer.push(`<div class="mobile_nav svelte-1d8gtus"><button class="button-reset svelte-1d8gtus">Menu</button> `);

	if (is_active) {
		$$renderer.push(`<!--[0--><div id="menu" class="menu svelte-1d8gtus"${$.attr_style(`background-image: url(${$.stringify(white_grit)}); background-size: 300px;`)}><button class="button-reset close-button svelte-1d8gtus">×</button> <nav class="svelte-1d8gtus"><a href="/shows" class="svelte-1d8gtus">Shows</a> <a href="/videos" class="svelte-1d8gtus">Video</a> <a href="/snackpack" class="svelte-1d8gtus">Newsletter</a> <a href="/about" class="svelte-1d8gtus">About</a> <a href="/potluck" class="svelte-1d8gtus">Potluck Qs</a> <a target="_blank" href="https://sentry.shop" class="svelte-1d8gtus">Swag</a></nav></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}