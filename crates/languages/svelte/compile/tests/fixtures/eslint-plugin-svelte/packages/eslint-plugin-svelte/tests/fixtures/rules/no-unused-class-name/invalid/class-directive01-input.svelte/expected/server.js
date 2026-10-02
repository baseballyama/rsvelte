import * as $ from 'svelte/internal/server';

export default function Class_directive01_input($$renderer) {
	$$renderer.push(`<div${$.attr_class('', void 0, { 'first': true })}>Hello</div> <span${$.attr_class('', void 0, { 'second': false })}>World!</span>`);
}