import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Hello world!</h1> <p>${$.escape(window.location.origin)}</p>`);
}