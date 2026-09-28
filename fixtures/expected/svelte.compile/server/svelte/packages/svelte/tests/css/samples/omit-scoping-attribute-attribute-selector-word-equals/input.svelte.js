import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><p data-foo="qux bar" class="svelte-160l1nt">this is styled</p> <p data-foo="qux baz">this is unstyled</p></div>`);
}