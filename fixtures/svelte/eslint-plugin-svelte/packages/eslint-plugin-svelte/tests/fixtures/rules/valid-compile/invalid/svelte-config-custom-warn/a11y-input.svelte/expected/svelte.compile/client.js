import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img/>`);

export default function A11y_input($$anchor) {
	let src = 'tutorial/image.gif';
	var img = root();

	$.set_attribute(img, 'src', src);
	$.autofocus(img, true);
	$.append($$anchor, img);
}