import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div${$.attr_class('', void 0, { 'foo': isFoo })}></div>`);
}