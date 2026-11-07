import * as $ from 'svelte/internal/server';

export default function Simple_css_input($$renderer) {
	let a = 10;

	$$renderer.push(`<span class="myClass svelte-1e4qekv">Hello!</span> <b class="svelte-1e4qekv">10</b>`);
}