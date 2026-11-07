import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	console.log('one');
	$$renderer.push(`<p>one</p>`);
}