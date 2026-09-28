import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<main class="svelte-b2g7ly"><div class="container svelte-b2g7ly"><h1>Svelte-gantt</h1> <p>A <b>lightweight</b> and <b>fast</b> interactive gantt chart/resource booking component made with Svelte. Compatible with any JS library or framework. ZERO dependencies.</p> <h2>Demo</h2> <p>To see the examples check the links in the header.</p></div></main>`);

export default function _page($$anchor) {
	var main = root();

	$.head('b2g7ly', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'svelte-gantt';
		});
	});

	$.append($$anchor, main);
}