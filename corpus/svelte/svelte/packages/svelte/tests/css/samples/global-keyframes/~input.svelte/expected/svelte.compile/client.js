import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="animated svelte-1tqisg0">animated</div> <div class="also-animated svelte-1tqisg0">also animated</div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}