import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div class="foo"></div> <a href="/">home</a> <a href="/foo">home</a>`);
}