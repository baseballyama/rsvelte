import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description" content="some description"/> <meta name="keywords" content="some keywords"/>`, 1);
var root_1 = $.from_html(`<div>Just a dummy page.</div>`);

export default function Main($$anchor) {
	var div = root_1();

	$.head('1w6zkw0', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	$.append($$anchor, div);
}