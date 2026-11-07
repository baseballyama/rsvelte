import * as $ from 'svelte/internal/server';

function iterated($$renderer) {
	$$renderer.push(`<span class="iterated-snippet svelte-1srp9ab">Text 4</span>`);
}

export default function Class01_input($$renderer) {
	$$renderer.push(`<span>Outside</span>`);
}