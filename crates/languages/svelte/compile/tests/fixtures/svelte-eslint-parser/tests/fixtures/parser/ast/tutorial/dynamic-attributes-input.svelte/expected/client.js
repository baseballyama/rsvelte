import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img/> <img/> <img alt="A man dances."/> <img alt="A man dances."/>`, 1);

export default function Dynamic_attributes_input($$anchor) {
	let src = 'tutorial/image.gif';
	var fragment = root();
	var img = $.sibling($.first_child(fragment), 2);

	$.set_attribute(img, 'src', src);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'src', src);

	var img_2 = $.sibling(img_1, 2);

	$.set_attribute(img_2, 'src', src);
	$.append($$anchor, fragment);
}