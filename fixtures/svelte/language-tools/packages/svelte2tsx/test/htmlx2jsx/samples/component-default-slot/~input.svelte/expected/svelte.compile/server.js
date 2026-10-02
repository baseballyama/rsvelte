import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1>Hello</h1>`);
		},
		$$slots: { default: true }
	});
}