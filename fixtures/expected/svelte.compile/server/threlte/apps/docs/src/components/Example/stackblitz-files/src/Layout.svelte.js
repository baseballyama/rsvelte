import * as $ from 'svelte/internal/server';
import App from './example/App.svelte';

export default function Layout($$renderer) {
	$$renderer.push(`<div class="svelte-1c50cix">`);
	App($$renderer, {});
	$$renderer.push(`<!----></div>`);
}