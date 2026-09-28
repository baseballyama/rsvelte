import * as $ from 'svelte/internal/server';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

export default function _page($$renderer) {
	$$renderer.push(`<h2>Events</h2> <p>Try interacting with the list below and check the event log in the console.</p> `);
	ExampleArea($$renderer, { example });
	$$renderer.push(`<!---->`);
}