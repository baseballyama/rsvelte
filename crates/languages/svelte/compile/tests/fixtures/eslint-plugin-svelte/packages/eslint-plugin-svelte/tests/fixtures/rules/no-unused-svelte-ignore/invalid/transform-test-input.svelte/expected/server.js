import * as $ from 'svelte/internal/server';

export default function Transform_test_input($$renderer) {
	$$renderer.push(`<img src="https://example.com/img.png" autofocus=""/>  <img src="https://example.com/img.png" alt="Foo"/> <div class="foo svelte-1irutuz"><div class="bar svelte-1irutuz"></div></div>`);
}