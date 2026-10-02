import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class svelte-wcht6">Hello</div> <span class="span-class svelte-wcht6">World!</span>`, 1);

export default function Selector_list01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}