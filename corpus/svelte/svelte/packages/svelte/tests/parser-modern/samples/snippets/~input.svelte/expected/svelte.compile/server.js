import * as $ from 'svelte/internal/server';

function foo($$renderer, msg) {
	$$renderer.push(`<p>${$.escape(msg)}</p>`);
}

export default function Input($$renderer) {
	foo($$renderer, msg);
}