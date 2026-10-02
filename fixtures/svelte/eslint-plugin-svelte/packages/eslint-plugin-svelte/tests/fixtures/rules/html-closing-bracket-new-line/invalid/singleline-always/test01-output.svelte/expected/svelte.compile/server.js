import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	$$renderer.push(`<div></div> <div></div>`);
}