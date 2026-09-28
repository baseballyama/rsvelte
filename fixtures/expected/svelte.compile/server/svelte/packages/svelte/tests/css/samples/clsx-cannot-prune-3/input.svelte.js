import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1${$.attr_class($.clsx({ [foo]: true }), 'svelte-r7ixbm')}>hello world</h1>`);
}