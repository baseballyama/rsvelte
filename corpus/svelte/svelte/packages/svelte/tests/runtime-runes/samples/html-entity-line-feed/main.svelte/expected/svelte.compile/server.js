import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<span id="attr" title="A
B"></span> <span id="attr-decimal" title="A
B"></span> <span id="attr-other-entity" title="©"></span> `);

	Component($$renderer, { text: 'A\nB' });
	$$renderer.push(`<!---->`);
}