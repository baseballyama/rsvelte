import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1></h1> <h2 aria-hidden="true">invisible header</h2>`);
}