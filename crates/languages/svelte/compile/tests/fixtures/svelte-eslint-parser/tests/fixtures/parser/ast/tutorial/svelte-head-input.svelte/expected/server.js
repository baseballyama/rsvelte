import * as $ from 'svelte/internal/server';

export default function Svelte_head_input($$renderer) {
	$.head('1nvzoue', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="stylesheet" href="tutorial/dark-theme.css"/>`);
	});

	$$renderer.push(`<h1>Hello world!</h1>`);
}