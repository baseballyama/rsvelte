import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span style="display: block;">Hello World!</span>`);

export default function Style_attribute01_input($$anchor) {
	var span = root();

	$.append($$anchor, span);
}