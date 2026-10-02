import * as $ from 'svelte/internal/server';

export default function Svelte_document_input($$renderer) {
	let selection = '';
	const handleSelectionChange = (e) => selection = document.getSelection();

	$$renderer.push(`<p>Select this text to fire events</p> <p>Selection: ${$.escape(selection)}</p>`);
}