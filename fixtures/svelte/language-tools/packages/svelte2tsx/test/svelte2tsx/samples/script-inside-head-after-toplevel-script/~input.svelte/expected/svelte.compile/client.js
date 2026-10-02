import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(
	`<link rel="stylesheet" href="/lib/jodit.es2018.min.css"/> <script src="/lib/jodit.es2018.min.js">

  </script>`,
	1
));

var root_1 = $.with_script($.from_html(`<div><script>let a = 'not top level';</script><!></div>`));

export default function Input($$anchor) {
	let b = 'top level';
	var div = root_1();

	$.head('1vb9gze', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	$.append($$anchor, div);
}