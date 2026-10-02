import * as $ from 'svelte/internal/server';
import Paragraph from './Paragraph.svelte';

export default function Main($$renderer) {
	let boundParagraphs = [];
	let store = [{ id: 1, text: 'b1' }, { id: 2, text: 'b2' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(store);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let text = each_array[i];

		$$renderer.push(`<div>`);
		Paragraph($$renderer, { text: text.text });
		$$renderer.push(`<!----> <button>change</button> <button>delete</button></div>`);
	}

	$$renderer.push(`<!--]-->`);
}