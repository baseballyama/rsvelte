import * as $ from 'svelte/internal/server';

export default function Shorthand02_input($$renderer) {
	let name = 'world';
	const max = 0;
	const width = 0;

	$$renderer.push(`<h1${$.attr_style('', { 'max-width': max-width })}>Hello world!</h1>`);
}