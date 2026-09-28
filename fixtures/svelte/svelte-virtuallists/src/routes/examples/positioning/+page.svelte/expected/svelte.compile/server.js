import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Positioning</h2> <p>The component provides properties to position the list either on an element, or at a pixel offset.</p> `);
	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}