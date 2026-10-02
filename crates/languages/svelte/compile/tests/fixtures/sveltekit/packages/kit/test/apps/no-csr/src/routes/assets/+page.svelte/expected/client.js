import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import image from './favicon.png?no-inline';

var root = $.from_html(`<img alt="svelte logo"/> <a href="/asset.json">includes public assets</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var img = $.first_child(fragment);

	$.next(2);
	$.template_effect(() => $.set_attribute(img, 'src', image));
	$.append($$anchor, fragment);
}