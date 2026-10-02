import * as $ from 'svelte/internal/server';

export default function Contenteditable_bindings_input($$renderer) {
	let html = '<p>Write some text!</p>';

	$$renderer.push(`<div contenteditable="true" class="svelte-140lnpe">`);

	if (html) {
		$$renderer.push(`${html}`);
	} else {}

	$$renderer.push(`</div> <pre>${$.escape(html)}</pre>`);
}