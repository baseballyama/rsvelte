import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class div-class-two svelte-1vqqfh5">Hello</div> <span class="span-class span-class-two span-class-three svelte-1vqqfh5">World!</span>`, 1);

export default function Multiple_class_names01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}