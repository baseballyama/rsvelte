import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let text = 'Hello world';

	$$renderer.push(`<p contenteditable="true">`);

	const $$body = $.escape(text);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</p> <p contenteditable="true">`);

	if (text) {
		$$renderer.push(`${text}`);
	} else {}

	$$renderer.push(`</p> <p contenteditable="true">`);

	if (text) {
		$$renderer.push(`${text}`);
	} else {}

	$$renderer.push(`</p>`);
}