import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This error page should not be visible</p>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	throw new Error('error page render error');

	var p = root();

	$.append($$anchor, p);
	$.pop();
}