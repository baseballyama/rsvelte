import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="animated svelte-q8vj86">animated</div> <div class="also-animated svelte-q8vj86">also animated</div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}