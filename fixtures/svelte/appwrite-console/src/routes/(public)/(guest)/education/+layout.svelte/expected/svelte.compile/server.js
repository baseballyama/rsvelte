import * as $ from 'svelte/internal/server';

import {
	ArtworkDark,
	ArtworkDarkMobile,
	ArtworkLightMobile,
	ArtworkLight
} from '$lib/images/github-education-program';

export default function _layout($$renderer, $$props) {
	$.head('t7ffg9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Sign up - Appwrite Education Program</title>`);
		});
	});

	$$renderer.push(`<section class="github-education-container svelte-t7ffg9"><div class="artwork svelte-t7ffg9"><div class="is-only-mobile"><img${$.attr('src', ArtworkDarkMobile)} alt="" class="u-only-dark svelte-t7ffg9"/> <img${$.attr('src', ArtworkLightMobile)} alt="" class="u-only-light svelte-t7ffg9"/></div> <div class="is-not-mobile"><img${$.attr('src', ArtworkDark)} alt="" class="u-only-dark svelte-t7ffg9"/> <img${$.attr('src', ArtworkLight)} alt="" class="u-only-light svelte-t7ffg9"/></div> <div class="mobile-gradient svelte-t7ffg9"></div></div> <div class="content-container svelte-t7ffg9"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div></section>`);
}