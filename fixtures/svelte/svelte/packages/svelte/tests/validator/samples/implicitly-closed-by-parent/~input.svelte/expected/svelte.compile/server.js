import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<main><div class="hello"></div></main> <main><div class="hello"><p>hello</p></div></main>`);
}