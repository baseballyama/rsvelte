import * as $ from 'svelte/internal/server';

function hello($$renderer) {
	$$renderer.push(`<p>hello world</p>`);
}

export default function Main($$renderer) {
	hello($$renderer);
}