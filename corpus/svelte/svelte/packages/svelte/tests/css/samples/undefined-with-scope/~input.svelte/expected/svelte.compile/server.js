import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p${$.attr_class($.clsx(undefined), 'svelte-6b81cx')}>Foo</p> <p${$.attr_class(undefined, 'svelte-6b81cx')}>Bar</p>`);
}