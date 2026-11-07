import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p class="foo svelte-1s6p4ms">foo</p> <p class="bar svelte-1s6p4ms">bar <span class="svelte-1s6p4ms">baz</span></p> <span class="svelte-1s6p4ms">buzz</span>`);
}