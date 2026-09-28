import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const b = 2;

	$$renderer.push(`<h1 class="svelte-pihepe">Testing Styles</h1> <h2 class="svelte-pihepe">Testing Styles 2</h2>`);
	$.bind_props($$props, { b });
}