import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div foo="bar" class="svelte-1wtl9gm"></div> <div baz="" class="svelte-1wtl9gm"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}