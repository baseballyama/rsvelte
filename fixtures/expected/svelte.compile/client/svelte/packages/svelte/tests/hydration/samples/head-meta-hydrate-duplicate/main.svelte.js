import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<link rel="canonical" href="/"/> <meta name="description" content="some description"/> <meta name="keywords" content="some keywords"/>`, 1);
var root_1 = $.from_html(`<div>Just a dummy page.</div>`);

export default function Main($$anchor) {
	var div = root_1();

	$.head('r55nhh', ($$anchor) => {
		var fragment = root();

		$.next(4);

		$.effect(() => {
			$.document.title = 'Some Title';
		});

		$.append($$anchor, fragment);
	});

	$.append($$anchor, div);
}