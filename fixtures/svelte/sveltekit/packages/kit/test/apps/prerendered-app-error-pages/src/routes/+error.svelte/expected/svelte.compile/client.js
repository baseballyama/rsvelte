import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This is your custom error page.</p>`);

export default function _error($$anchor) {
	var p = root();

	$.append($$anchor, p);
}