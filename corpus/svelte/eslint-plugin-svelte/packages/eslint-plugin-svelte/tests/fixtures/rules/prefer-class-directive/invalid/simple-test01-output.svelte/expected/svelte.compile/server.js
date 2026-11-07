import * as $ from 'svelte/internal/server';

export default function Simple_test01_output($$renderer) {
	let current = 'foo';

	$$renderer.push(`<button${$.attr_class('svelte-tz2q6v', void 0, { 'selected': current === 'foo' })}>foo</button> <button${$.attr_class('svelte-tz2q6v', void 0, { 'selected': current === 'bar' })}>bar</button> <button${$.attr_class('svelte-tz2q6v', void 0, { 'selected': current === 'baz' })}>baz</button>`);
}