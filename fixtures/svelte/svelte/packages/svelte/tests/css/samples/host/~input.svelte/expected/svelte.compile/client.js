import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-bcym45">Hello!</h1> <div class="svelte-bcym45"><span class="svelte-bcym45">World!</span></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}