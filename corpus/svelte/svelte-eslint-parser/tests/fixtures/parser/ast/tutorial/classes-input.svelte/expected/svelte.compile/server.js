import * as $ from 'svelte/internal/server';

export default function Classes_input($$renderer) {
	let current = 'foo';

	$$renderer.push(`<button${$.attr_class('svelte-1hnszsq', void 0, { 'selected': current === 'foo' })}>foo</button> <button${$.attr_class('svelte-1hnszsq', void 0, { 'selected': current === 'bar' })}>bar</button> <button${$.attr_class(current === 'baz' ? 'selected' : '', 'svelte-1hnszsq')}>baz</button>`);
}