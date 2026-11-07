import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class">Hello</div> <span class="span-class">World!</span>`, 1);

export default function Same_name_id01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}