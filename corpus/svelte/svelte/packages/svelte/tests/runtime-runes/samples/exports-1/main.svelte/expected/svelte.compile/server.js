import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';

export default function Main($$renderer) {
	let sub;

	Sub($$renderer, {});
	$$renderer.push(`<!----> <button>Increment</button> <button>Decrement</button> <button>Double</button>`);
}