import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class svelte-s9o84k">Hello</div> <span class="span-class svelte-s9o84k">World!</span>`, 1);

export default function Adjacent_sibling_combinator01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}