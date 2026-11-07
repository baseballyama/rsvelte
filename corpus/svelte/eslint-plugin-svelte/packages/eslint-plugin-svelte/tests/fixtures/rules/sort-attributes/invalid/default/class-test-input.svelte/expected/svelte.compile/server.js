import * as $ from 'svelte/internal/server';

export default function Class_test_input($$renderer) {
	let a;
	let b;

	$$renderer.push(`<div${$.attr_class('foo', void 0, { 'a': a, 'b': b })}></div> <div${$.attr_class('foo', void 0, { 'b': b, 'a': a })}></div> <div${$.attr_class('foo', void 0, { 'a': a, 'b': b })}></div>`);
}