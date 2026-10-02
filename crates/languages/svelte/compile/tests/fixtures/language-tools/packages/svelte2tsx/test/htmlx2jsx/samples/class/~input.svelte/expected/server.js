import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1${$.attr_class('', void 0, { 'active': "test" == "test" })}>Hello</h1> <h1${$.attr_class('', void 0, { 'active': "test" == "test" })}>Hello</h1>`);
}