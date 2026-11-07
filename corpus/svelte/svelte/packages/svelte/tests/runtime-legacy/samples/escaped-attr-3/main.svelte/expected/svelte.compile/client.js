import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div title="&amp;&lt;">blah</div>`);

export default function Main($$anchor) {
	var div = root();

	$.append($$anchor, div);
}