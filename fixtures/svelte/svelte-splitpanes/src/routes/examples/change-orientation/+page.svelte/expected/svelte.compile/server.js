import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Change orientation &amp; first splitter</h2> <p>When changing direction, all the panes current width or height will flip to adapt to the new
  layout.</p> <p>Showing the first splitter is an option which allows user to double click the splitter to maximize
  the next pane. <br/> The first splitter does not allow to resize the next pane.</p> `);

	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}