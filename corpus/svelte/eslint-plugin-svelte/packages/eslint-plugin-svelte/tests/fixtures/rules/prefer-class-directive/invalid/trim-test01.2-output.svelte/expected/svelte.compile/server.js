import * as $ from 'svelte/internal/server';

export default function Trim_test01_2_output($$renderer) {
	let current = 'foo';
	let active = true;

	$$renderer.push(`<button${$.attr_class('', void 0, { 'selected': current === 'foo', 'active': active })}>foo</button>`);
}