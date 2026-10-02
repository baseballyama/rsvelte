import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="thing" class="svelte-2wk7c9">this text is red</p>`);

export default function Thing($$anchor) {
	var p = root();

	$.append($$anchor, p);
}