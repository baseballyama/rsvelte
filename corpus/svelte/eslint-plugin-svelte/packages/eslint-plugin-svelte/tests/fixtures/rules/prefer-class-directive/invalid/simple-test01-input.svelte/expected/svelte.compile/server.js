import * as $ from 'svelte/internal/server';

export default function Simple_test01_input($$renderer) {
	let current = 'foo';

	$$renderer.push(`<button${$.attr_class($.clsx(current === 'foo' ? 'selected' : ''), 'svelte-hk31ny')}>foo</button> <button${$.attr_class($.clsx(current === 'bar' ? 'selected' : ''), 'svelte-hk31ny')}>bar</button> <button${$.attr_class($.clsx(current === 'baz' ? 'selected' : ''), 'svelte-hk31ny')}>baz</button>`);
}