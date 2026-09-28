import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<a href="/foo"></a> <a href="#foo">bar</a>`);
}