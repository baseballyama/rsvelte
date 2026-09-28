import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';

export default function Main($$renderer) {
	let button;

	Sub($$renderer, {});
	$$renderer.push(`<!----> <button>Increment</button>`);
}