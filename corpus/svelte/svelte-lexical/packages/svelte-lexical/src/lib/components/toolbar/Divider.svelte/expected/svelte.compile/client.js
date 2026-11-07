import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="divider"></div>`);

export default function Divider($$anchor) {
	var div = root();

	$.append($$anchor, div);
}