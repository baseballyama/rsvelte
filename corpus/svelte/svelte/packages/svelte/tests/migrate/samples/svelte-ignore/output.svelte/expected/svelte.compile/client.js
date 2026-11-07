import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Output($$anchor) {
	function foo() {
		// svelte-ignore reactive_declaration_invalid_placement
		$: x = 1;
	}

	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}