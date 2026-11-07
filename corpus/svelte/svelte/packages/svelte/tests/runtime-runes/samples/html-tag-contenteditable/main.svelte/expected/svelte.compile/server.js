import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let content = "";

	$$renderer.push(`<div id="editable" contenteditable="true">${$.html(content)}</div> <p id="output">${$.escape(content)}</p>`);
}