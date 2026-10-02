import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class svelte-1gj60ou">Hello</div> <span class="span-class svelte-1gj60ou">World!</span>`, 1);

export default function General_sibling_combinator01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}