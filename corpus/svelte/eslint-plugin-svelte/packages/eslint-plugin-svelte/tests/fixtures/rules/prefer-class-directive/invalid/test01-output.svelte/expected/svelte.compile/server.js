import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	let selected = 'foo';

	$$renderer.push(`<button${$.attr_class('', void 0, { 'selected': selected })}>foo</button> <button${$.attr_class('a b', void 0, { 'selected': selected })}>foo</button> <button${$.attr_class('a b', void 0, { 'selected': selected })}>foo</button>`);
}