import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div${$.attr('data-foo', true)} data-bare="" data-bar="to"></div>`);
}