import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer) {
	$.head('jllqd3', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>b</title>`);
		});
	});

	$$renderer.push(`<h1>b</h1> <form method="POST"><button id="submit">submit</button></form>`);
}