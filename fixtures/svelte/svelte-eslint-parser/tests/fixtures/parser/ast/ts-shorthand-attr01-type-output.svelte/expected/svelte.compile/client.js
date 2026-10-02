import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img alt="foo"/> <img alt="foo"/>`, 1);

export default function Ts_shorthand_attr01_type_output($$anchor) {
	const src = 'Hello'; // src: "Hello"
	var fragment = root();
	var img = $.first_child(fragment);

	$.set_attribute(img, 'src', src);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'src', src);
	$.append($$anchor, fragment);
}