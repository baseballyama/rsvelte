import * as $ from 'svelte/internal/server';
import App from './App.svelte';

export default function Main($$renderer) {
	let count = 0;

	$$renderer.push(`<button>remount</button> <!---->`);

	{
		App($$renderer, { count });
	}

	$$renderer.push(`<!---->`);
}