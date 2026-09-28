import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<meta name="author" content="Re:Designed"/> <link rel="author" href="https://example.com"/> <script type="application/ld+json"></script>`, 1));
var root_1 = $.from_html(`<div class="svelte-rtybfk">dummy</div>`);

export default function Main($$anchor) {
	var div = root_1();

	$.head('rtybfk', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	$.append($$anchor, div);
}