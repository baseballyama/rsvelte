import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><p class="hello"><span></span></p><p></p></div> <div><p class="hello"></p><p></p></div>`);
}