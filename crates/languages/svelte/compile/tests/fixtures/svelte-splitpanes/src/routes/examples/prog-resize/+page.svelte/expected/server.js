import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Programmatic resizing</h2> <p>This example shows the programmatic way of resizing panes with two-way data biding. And how it
  works both ways. <br/> Changing programmatically the size one pane, will shrink/expand the other panes that have no specified
  size, as you can see in the example.</p> `);

	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}