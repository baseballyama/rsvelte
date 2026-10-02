import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><img src="this-is-fine.jpg"/></div> <div scope=""></div> <div><img src="this-is-fine.jpg"/> <div scope=""></div></div>`, 1);

export default function Input($$anchor) {
	function foo() {
		// svelte-ignore non-top-level-reactive-declaration
		$: x = 1;
	}

	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}