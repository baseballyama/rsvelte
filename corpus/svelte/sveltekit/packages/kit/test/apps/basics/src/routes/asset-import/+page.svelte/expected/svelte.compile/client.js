import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import small from './small.png';
import large from './large.jpg';

var root = $.from_html(`<img alt="svelte"/> <img alt="potatoes"/>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var img = $.first_child(fragment);
	var img_1 = $.sibling(img, 2);

	$.template_effect(() => {
		$.set_attribute(img, 'src', small);
		$.set_attribute(img_1, 'src', large);
	});

	$.append($$anchor, fragment);
}