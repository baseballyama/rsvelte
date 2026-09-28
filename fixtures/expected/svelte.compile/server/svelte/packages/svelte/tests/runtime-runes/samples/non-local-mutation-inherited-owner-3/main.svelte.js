import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let items = [
		{ id: "test", name: "this is a test" },
		{ id: "test2", name: "this is a second test" }
	];

	let found = void 0;

	function onclick() {
		found = items.find((c) => c.id === 'test2');
	}

	$$renderer.push(`<button>First click here</button> `);
	Child($$renderer, { item: found });
	$$renderer.push(`<!---->`);
}