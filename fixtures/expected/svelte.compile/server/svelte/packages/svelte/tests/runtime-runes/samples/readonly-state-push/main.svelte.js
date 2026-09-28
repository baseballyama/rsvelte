import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let array = [1, 2, 3, 4];

	const addNew = () => {
		array.push(0);
	};

	$$renderer.push(`<button>add</button> `);
	Child($$renderer, { array });
	$$renderer.push(`<!---->`);
}