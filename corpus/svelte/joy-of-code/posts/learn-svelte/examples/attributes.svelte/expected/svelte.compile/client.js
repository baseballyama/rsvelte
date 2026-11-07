import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><img/></div>`);

export default function Attributes($$anchor) {
	let src = 'https://svelte.dev/tutorial/image.gif';
	let alt = 'Person dancing';
	var div = root();
	var img = $.child(div);

	$.set_attribute(img, 'src', src);
	$.set_attribute(img, 'alt', alt);
	$.reset(div);
	$.append($$anchor, div);
}