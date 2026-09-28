import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let child;

	Child($$renderer, {});
	$$renderer.push(`<!----> <button>log</button>`);
}