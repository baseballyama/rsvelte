import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	$$renderer.push(`<div><div></div></div> <div></div> <div class="foo"></div>`);
}