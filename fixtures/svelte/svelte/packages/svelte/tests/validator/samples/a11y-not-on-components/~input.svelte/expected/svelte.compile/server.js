import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Input($$renderer) {
	Widget($$renderer, {
		scope: 'foo',
		children: ($$renderer) => {
			$$renderer.push(`<input autofocus=""/>`);
		},
		$$slots: { default: true }
	});
}