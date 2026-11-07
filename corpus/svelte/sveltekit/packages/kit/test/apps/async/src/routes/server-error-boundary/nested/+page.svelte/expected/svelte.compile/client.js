import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>This nested page should not be visible</h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	throw new Error('nested render error');

	var h1 = root();

	$.append($$anchor, h1);
	$.pop();
}