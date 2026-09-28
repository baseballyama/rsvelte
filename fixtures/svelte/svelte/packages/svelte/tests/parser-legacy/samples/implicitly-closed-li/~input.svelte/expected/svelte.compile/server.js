import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<ul><li>a</li><li>b</li><li>c</li></ul>`);
}