import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Min &amp; max with snap</h2> <p>You can also snap to the panel maximum and minimum size.</p> `);
	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}