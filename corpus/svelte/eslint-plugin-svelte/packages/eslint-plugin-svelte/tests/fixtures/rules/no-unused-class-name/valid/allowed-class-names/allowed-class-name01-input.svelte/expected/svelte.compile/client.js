import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class">Hello</div> <span class="span-class">World!</span> <span class="p-2">Regex!</span>`, 1);

export default function Allowed_class_name01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}