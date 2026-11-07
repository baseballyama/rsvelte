import * as $ from 'svelte/internal/server';

export default function Simple_css_input($$renderer) {
	let a = 10;

	$$renderer.push(`<span class="myClass svelte-ryq88m">Hello!</span> <b class="svelte-ryq88m">10</b>`);
}