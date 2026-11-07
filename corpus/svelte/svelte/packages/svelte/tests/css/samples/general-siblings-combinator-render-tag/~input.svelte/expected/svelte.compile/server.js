import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<p class="svelte-1tyycfi">this should be green</p>`);
}

export default function Input($$renderer) {
	$$renderer.push(`<h1 class="svelte-1tyycfi">Hello</h1> `);
	foo($$renderer);
	$$renderer.push(`<!---->`);
}