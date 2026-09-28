import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	let array = [{ v: 1 }];

	const addNew = () => {
		array.push({ v: 2 });
	};

	$$renderer.push(`<button>add</button> `);
	Child($$renderer, { array });
	$$renderer.push(`<!---->`);
}