import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	function click() {}

	$$renderer.push(`<input type="checkbox"/> <button type="button"></button> <input type="checkbox"/> <button></button>`);
}