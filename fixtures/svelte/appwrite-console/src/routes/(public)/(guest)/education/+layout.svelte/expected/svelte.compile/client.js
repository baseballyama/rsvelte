import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ArtworkDark,
	ArtworkDarkMobile,
	ArtworkLightMobile,
	ArtworkLight
} from '$lib/images/github-education-program';

var root = $.from_html(`<section class="github-education-container svelte-t7ffg9"><div class="artwork svelte-t7ffg9"><div class="is-only-mobile"><img alt="" class=" u-only-dark svelte-t7ffg9"/> <img alt="" class="u-only-light svelte-t7ffg9"/></div> <div class="is-not-mobile"><img alt="" class="u-only-dark svelte-t7ffg9"/> <img alt="" class="u-only-light svelte-t7ffg9"/></div> <div class="mobile-gradient svelte-t7ffg9"></div></div> <div class="content-container svelte-t7ffg9"><!></div></section>`);

export default function _layout($$anchor, $$props) {
	var section = root();

	$.head('t7ffg9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sign up - Appwrite Education Program';
		});
	});

	var div = $.child(section);
	var div_1 = $.child(div);
	var img = $.child(div_1);
	var img_1 = $.sibling(img, 2);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var img_2 = $.child(div_2);
	var img_3 = $.sibling(img_2, 2);

	$.reset(div_2);
	$.next(2);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var node = $.child(div_3);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div_3);
	$.reset(section);

	$.template_effect(() => {
		$.set_attribute(img, 'src', ArtworkDarkMobile);
		$.set_attribute(img_1, 'src', ArtworkLightMobile);
		$.set_attribute(img_2, 'src', ArtworkDark);
		$.set_attribute(img_3, 'src', ArtworkLight);
	});

	$.append($$anchor, section);
}