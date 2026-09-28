import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);
	Widget($$renderer, { foo: '' });
	$$renderer.push(`<!----></div>`);
}