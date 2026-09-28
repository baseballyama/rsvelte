import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><figure><img src="potato.jpg"/> <marquee><figcaption>potato</figcaption></marquee></figure> <figure><img src="potato.jpg"/> <marquee><figcaption>potato</figcaption></marquee></figure></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}