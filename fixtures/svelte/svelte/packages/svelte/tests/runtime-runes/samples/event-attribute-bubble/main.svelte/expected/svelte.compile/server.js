import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';

export default function Main($$renderer) {
	let count = 0;
	let onclick = () => count++;

	Sub($$renderer, { onclick, increment: onclick, count });
	$$renderer.push(`<!----> <button>change handler</button>`);
}