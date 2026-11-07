import * as $ from 'svelte/internal/server';
import Component from './component.svelte';

export default function Input($$renderer) {
	$$renderer.push(`<label>`);
	x($$renderer);
	$$renderer.push(`<!----></label>`);
}