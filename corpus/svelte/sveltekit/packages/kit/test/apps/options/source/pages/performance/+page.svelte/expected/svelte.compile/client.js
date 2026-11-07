import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Image from './icon.svg?no-inline';

var root = $.from_html(
	`<p>this app has paths.assets set so it should not use relative paths for imported assets in the
	client code</p> <img alt="svelte logo"/>`,
	1
);

export default function _page($$anchor) {
	var fragment = root();
	var img = $.sibling($.first_child(fragment), 2);

	$.template_effect(() => $.set_attribute(img, 'src', Image));
	$.append($$anchor, fragment);
}