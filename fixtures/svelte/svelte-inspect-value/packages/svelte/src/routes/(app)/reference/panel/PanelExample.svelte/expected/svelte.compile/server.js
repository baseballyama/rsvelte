import * as $ from 'svelte/internal/server';
import Todo from './Todo.svelte';

export default function PanelExample($$renderer) {
	$$renderer.push(`<h3>Demo</h3> <div id="panel-example" class="svelte-1hhtzqm">`);
	Todo($$renderer, {});
	$$renderer.push(`<!----></div>`);
}