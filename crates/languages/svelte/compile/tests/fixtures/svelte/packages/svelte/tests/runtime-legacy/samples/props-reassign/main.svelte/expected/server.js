import * as $ from 'svelte/internal/server';
import App from './App.svelte';

export default function Main($$renderer) {
	let a = 0;

	$$renderer.push(`<button>increment</button> `);
	App($$renderer, { a });
	$$renderer.push(`<!---->`);
}