import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello <strong></strong><span>How are you?</span></h1>`);

export default function Input($$anchor) {
	var h1 = root();
	var strong = $.sibling($.child(h1));

	strong.textContent = `${name ?? ''}!`;
	$.next();
	$.reset(h1);
	$.append($$anchor, h1);
}