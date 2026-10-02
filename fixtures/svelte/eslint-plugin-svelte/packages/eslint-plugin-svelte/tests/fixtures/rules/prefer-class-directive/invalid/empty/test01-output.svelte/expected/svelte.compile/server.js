import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	let selected = 'foo';
	let children = 1;

	$$renderer.push(`<button${$.attr_class('', void 0, { 'selected': selected })}>foo</button> <button${$.attr_class('a b', void 0, { 'selected': selected })}>foo</button> <button${$.attr_class('a b', void 0, { 'selected': selected })}>foo</button> <div${$.attr_class('d-flex', void 0, { 'gap-3': children > 1 })}>foo</div> <div${$.attr_class('d-flex', void 0, { 'gap-3': children !== 1 })}>foo</div>`);
}