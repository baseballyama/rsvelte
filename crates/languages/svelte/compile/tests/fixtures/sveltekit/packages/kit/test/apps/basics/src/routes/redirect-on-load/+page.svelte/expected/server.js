import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Woops!</h1> <p>You shouldn't be here. You should have been directed to /redirect!</p>`);
}