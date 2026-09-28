import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>boom</p>`);

export default function Child($$anchor) {
	// it's important for the test that this isn't an `Error`
	throw 'child error';

	var p = root();

	$.append($$anchor, p);
}