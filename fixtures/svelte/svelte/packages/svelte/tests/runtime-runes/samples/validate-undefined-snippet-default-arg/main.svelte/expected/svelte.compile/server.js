import * as $ from 'svelte/internal/server';

function test($$renderer, param = "default") {
	$$renderer.push(`<p>${$.escape(param)}</p>`);
}

export default function Main($$renderer) {
	test($$renderer);
}