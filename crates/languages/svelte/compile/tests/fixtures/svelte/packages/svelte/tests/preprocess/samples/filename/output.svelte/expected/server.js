import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	console.log('file.svelte');
	$$renderer.push(`<h1>Hello file.svelte!</h1>`);
}