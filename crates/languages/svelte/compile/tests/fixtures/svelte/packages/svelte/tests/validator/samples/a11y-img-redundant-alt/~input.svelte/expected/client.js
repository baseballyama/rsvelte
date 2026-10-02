import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img src="foo" alt="Foo eating a sandwich."/> <img src="bar" aria-hidden="true" alt="Picture of me taking a photo of an image"/> <img src="foo" alt="Photo of foo being weird."/> <img src="bar" alt="Image of me at a bar!"/> <img src="foo" alt="Picture of baz fixing a bug."/> <img src="bar" alt="Plant doing photosynthesis in the afternoon"/> <img src="foo" alt="Picturesque food"/> <img src="baz"/> <img src="baz" alt=""/>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var img = $.sibling($.first_child(fragment), 14);

	$.set_attribute(img, 'alt', 'baz');
	$.next(2);
	$.append($$anchor, fragment);
}