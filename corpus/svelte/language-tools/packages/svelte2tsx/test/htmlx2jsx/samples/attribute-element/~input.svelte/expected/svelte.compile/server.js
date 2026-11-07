import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div contenteditable=""></div> <div${$.attr('contenteditable', contentEditable)}></div> <div${$.attr('contenteditable', contenteditable)}></div>`);
}