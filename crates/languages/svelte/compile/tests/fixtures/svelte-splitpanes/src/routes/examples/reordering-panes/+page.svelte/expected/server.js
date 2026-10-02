import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Reordering Panes</h2> `);
	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}