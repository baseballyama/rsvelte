import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<figure><img src="foo.jpg" alt="a foo"/> <figcaption>a foo in its natural habitat</figcaption></figure>`);

export default function Input($$anchor) {
	var figure = root();

	$.append($$anchor, figure);
}