import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta aria-hidden="false"/> <meta role="tooltip"/>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}