import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><img src="this-is-fine.jpg"/> <marquee>but this is still discouraged</marquee></div> <img src="potato.jpg"/>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}