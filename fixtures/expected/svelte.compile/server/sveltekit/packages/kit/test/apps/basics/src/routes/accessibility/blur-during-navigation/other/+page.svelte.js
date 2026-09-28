import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Other page</h1> <a href="/accessibility/blur-during-navigation/page-with-input">Back</a>`);
}