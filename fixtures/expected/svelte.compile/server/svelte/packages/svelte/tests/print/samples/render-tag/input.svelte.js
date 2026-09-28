import * as $ from 'svelte/internal/server';

function sum($$renderer, a, b) {
	$$renderer.push(`<p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(a + b)}</p>`);
}

export default function Input($$renderer) {
	sum($$renderer, 1, 2);
	$$renderer.push(`<!----> `);
	sum($$renderer, 3, 4);
	$$renderer.push(`<!----> `);
	sum($$renderer, 5, 6);
	$$renderer.push(`<!---->`);
}