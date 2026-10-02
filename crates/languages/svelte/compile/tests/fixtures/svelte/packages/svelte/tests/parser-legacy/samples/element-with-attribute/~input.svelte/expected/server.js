import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<span attr="foo"></span> <span attr="bar"></span>`);
}