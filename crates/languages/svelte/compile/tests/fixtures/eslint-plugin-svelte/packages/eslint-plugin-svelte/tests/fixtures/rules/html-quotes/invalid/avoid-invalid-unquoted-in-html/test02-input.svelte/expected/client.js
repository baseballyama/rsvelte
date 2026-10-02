import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img/>`);

export default function Test02_input($$anchor) {
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';
	var img = root();

	$.set_attribute(img, 'src', src === "foo" ? 'a' : "b");
	$.set_attribute(img, 'alt', 'Rick Astley dances.');
	$.append($$anchor, img);
}