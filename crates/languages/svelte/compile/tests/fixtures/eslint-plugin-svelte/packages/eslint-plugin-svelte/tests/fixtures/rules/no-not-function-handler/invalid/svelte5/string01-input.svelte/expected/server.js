import * as $ from 'svelte/internal/server';

export default function String01_input($$renderer) {
	const a = 'hello!';
	const b = `${a} world`;

	$$renderer.push(`<button></button> <button></button>`);
}