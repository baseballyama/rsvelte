import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let object = { count: 0 };

	$$renderer.push(`<button>clicks: ${$.escape(object.count)}</button> `);
	Child($$renderer, { object });
	$$renderer.push(`<!---->`);
}