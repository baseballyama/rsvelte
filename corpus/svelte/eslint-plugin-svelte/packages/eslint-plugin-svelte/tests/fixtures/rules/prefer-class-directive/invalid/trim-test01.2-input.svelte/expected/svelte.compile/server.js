import * as $ from 'svelte/internal/server';

export default function Trim_test01_2_input($$renderer) {
	let current = 'foo';
	let active = true;

	$$renderer.push(`<button${$.attr_class($.clsx(current === 'foo' ? 'selected' : ''), void 0, { 'active': active })}>foo</button>`);
}