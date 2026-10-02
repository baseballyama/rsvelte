import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><a href="/foo">bar</a></div> <br/>`);
}