import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	console.log('__SCRIPT_FILENAME__');
	$$renderer.push(`<h1>Hello __MARKUP_FILENAME__!</h1>`);
}