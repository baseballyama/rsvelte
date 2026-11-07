import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$.head('b2g7ly', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>svelte-gantt</title>`);
		});
	});

	$$renderer.push(`<main class="svelte-b2g7ly"><div class="container svelte-b2g7ly"><h1>Svelte-gantt</h1> <p>A <b>lightweight</b> and <b>fast</b> interactive gantt chart/resource booking component made with Svelte. Compatible with any JS library or framework. ZERO dependencies.</p> <h2>Demo</h2> <p>To see the examples check the links in the header.</p></div></main>`);
}