import * as $ from 'svelte/internal/server';

function hi2($$renderer, a = 1) {
	$$renderer.push(`<!---->hello world `);
	Test($$renderer, {});
	$$renderer.push(`<!---->`);
}

export default function Input($$renderer) {
	hi2($$renderer, 1);
}