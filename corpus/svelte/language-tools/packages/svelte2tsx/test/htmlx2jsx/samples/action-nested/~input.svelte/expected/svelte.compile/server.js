import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<svg></svg> <div><input/> <p></p> <unknowntag></unknowntag></div>`);
}