import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div foo="bar"></div> <div foo="bar baz"></div>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}