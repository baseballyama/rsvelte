import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-p00wmd"></div>`);

export default function Style_lang01_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}