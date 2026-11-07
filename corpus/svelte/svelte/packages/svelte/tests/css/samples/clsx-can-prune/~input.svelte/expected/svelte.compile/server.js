import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let condition = Math.random() < 0.5;

	$$renderer.push(`<p${$.attr_class($.clsx(['used1']), 'svelte-18a10p')}></p> <p${$.attr_class($.clsx([{ used2: true }]), 'svelte-18a10p')}></p> <p${$.attr_class($.clsx({ used3: true }), 'svelte-18a10p')}></p> <p${$.attr_class($.clsx({ 'used4 used5': true }), 'svelte-18a10p')}></p> <p${$.attr_class($.clsx({ used6 }), 'svelte-18a10p')}></p> <p${$.attr_class($.clsx([condition ? 'used7' : 'used8']), 'svelte-18a10p')}></p> <p${$.attr_class($.clsx([condition && 'used9']), 'svelte-18a10p')}></p>`);
}