import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<p class="svelte-j9nscd">this should be green</p>`);
}

export default function Input($$renderer) {
	$$renderer.push(`<h1 class="svelte-j9nscd">Hello</h1> `);
	foo($$renderer);
	$$renderer.push(`<!---->`);
}