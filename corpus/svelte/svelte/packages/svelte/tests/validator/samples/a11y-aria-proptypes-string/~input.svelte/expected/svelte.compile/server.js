import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div aria-label="true"></div> <div${$.attr('aria-label', true)}></div> <div${$.attr('aria-label', false)}></div> <div${$.attr('aria-label', 1234)}></div> <div${$.attr('aria-label', !true)}></div>`);
}