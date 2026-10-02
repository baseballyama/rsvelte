import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="my-class">Hello World!</span>`);

export default function Class_attribute01_input($$anchor) {
	var span = root();

	$.append($$anchor, span);
}