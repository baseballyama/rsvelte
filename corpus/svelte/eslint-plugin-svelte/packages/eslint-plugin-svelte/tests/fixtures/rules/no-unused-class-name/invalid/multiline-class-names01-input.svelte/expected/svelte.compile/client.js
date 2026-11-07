import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<div class="div-class div-class-two svelte-4xxjtk">Hello</div> <span class="
    span-class
    span-class-two
    span-class-three
   svelte-4xxjtk">World!</span>`,
	1
);

export default function Multiline_class_names01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}