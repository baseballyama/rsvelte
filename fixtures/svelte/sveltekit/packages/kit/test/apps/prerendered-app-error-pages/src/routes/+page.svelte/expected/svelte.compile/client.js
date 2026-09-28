import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This app exists to assert that an app with only prerendered routes successfully renders custom
	error pages.</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}