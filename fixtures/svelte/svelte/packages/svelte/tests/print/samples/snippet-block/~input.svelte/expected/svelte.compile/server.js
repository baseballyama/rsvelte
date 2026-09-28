import * as $ from 'svelte/internal/server';

function name($$renderer, param1, param2, paramN) {
	$$renderer.push(`<!---->Foo`);
}

export default function Input($$renderer) {}