import * as $ from 'svelte/internal/server';

export default function App($$renderer) {
	let name = 'World';

	$$renderer.push(`<div class="svelte-11794o2">Hello World</div>`);
}