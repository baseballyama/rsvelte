import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img/>`);

export default function Undef01_input($$anchor) {
	let name = 'Rick Astley';
	var img = root();

	$.set_attribute(img, 'src', src);
	$.set_attribute(img, 'alt', 'Rick Astley dances.');
	$.append($$anchor, img);
}