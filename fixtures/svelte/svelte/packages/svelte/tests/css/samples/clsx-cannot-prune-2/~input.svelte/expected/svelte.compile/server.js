import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1${$.attr_class($.clsx({ foo: true, ...rest }), 'svelte-7lvl0j')}>hello world</h1>`);
}