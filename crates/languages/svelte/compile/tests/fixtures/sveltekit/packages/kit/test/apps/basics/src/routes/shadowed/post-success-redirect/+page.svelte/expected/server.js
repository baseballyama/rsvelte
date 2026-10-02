import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<form method="POST"><button>Click me</button></form>`);
}