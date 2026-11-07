import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://svelte.dev/" target="_blank" rel="noopener">link</a>,`, 1);

export default function Allow_referrer_test01_input($$anchor) {
	var fragment = root();

	$.next();
	$.append($$anchor, fragment);
}