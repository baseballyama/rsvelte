import * as $ from 'svelte/internal/server';

const foo = 42;

export default function Main($$renderer) {
	$$renderer.push(`<p>42</p>`);
}