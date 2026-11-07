import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1${$.attr_class($.clsx([foo]), 'svelte-9evu1c')}>hello world</h1>`);
}