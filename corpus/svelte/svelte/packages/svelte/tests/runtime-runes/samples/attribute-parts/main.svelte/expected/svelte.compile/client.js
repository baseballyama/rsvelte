import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <img/>`, 1);

export default function Main($$anchor) {
	let a = 1;
	let b = 2;
	let c = 3;
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, '123');

	var img = $.sibling(div, 2);

	$.set_attribute(img, 'src', '12 hello, world 13');
	$.append($$anchor, fragment);
}