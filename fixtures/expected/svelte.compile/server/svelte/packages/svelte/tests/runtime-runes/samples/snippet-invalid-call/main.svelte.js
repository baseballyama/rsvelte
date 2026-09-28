import * as $ from 'svelte/internal/server';

function test($$renderer) {
	$$renderer.push(`<p>hello</p>`);
}

export default function Main($$renderer) {
	test();
}