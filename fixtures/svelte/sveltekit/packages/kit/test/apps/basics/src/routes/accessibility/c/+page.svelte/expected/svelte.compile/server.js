import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer) {
	$.head('19vhmaa', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>c</title>`);
		});
	});

	$$renderer.push(`<h1>c</h1> <form method="POST"><button id="submit">submit</button></form>`);
}