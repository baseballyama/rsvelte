import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="not-match"><div></div></div> <div class="match svelte-1u6f6f4"><div class="svelte-1u6f6f4"></div> <div class="svelte-1u6f6f4"></div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}