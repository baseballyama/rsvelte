import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class svelte-12o95au">Hello</div> <span class="span-class svelte-12o95au">World!</span>`, 1);

export default function Used_class_name01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}