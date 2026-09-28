import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<x class="svelte-1y5fmrl"><y class="svelte-1y5fmrl"></y></x>`);
}

export default function Input($$renderer) {
	foo($$renderer);
}