import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><img src="this-is-fine.jpg"/></div> <div><img src="this-is-fine.jpg"/></div> <div scope=""></div> <div scope=""></div> <div scope=""></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}