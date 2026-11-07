import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class svelte-a92x7m">Hello</div> <span class="span-class svelte-a92x7m">World!</span>`, 1);

export default function Pseudo_elements01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}