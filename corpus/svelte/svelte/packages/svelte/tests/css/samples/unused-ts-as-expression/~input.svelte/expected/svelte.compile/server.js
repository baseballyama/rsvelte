import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div${$.attr(
		'data-active',
		//
		false
	)}><span></span></div>`);
}