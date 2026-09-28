import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Lots of splitters &amp; push other panes - all panes have a min width of 5%</h2> `);
	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}