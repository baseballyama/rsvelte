import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1> <img src="..." loading="lazy"/>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}