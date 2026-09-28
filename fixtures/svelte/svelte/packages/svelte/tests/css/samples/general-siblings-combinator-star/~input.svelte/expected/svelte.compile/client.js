import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="not-match"><div></div></div> <div class="match svelte-q01frn"><div class="svelte-q01frn"></div> <div class="svelte-q01frn"></div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}