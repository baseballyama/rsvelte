import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="foo svelte-1s6p4ms">foo</p> <p class="bar svelte-1s6p4ms">bar <span class="svelte-1s6p4ms">baz</span></p> <span class="svelte-1s6p4ms">buzz</span>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}