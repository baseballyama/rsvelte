import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	console.log('Target');
	$$renderer.push(`<h1>Hello</h1>`);
}