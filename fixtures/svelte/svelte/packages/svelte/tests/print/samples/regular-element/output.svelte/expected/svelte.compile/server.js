import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$$renderer.push(`<div><a href="/foo">bar</a></div> <br/>`);
}