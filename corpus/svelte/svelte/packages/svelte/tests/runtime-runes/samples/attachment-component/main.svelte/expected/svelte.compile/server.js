import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let message = 'one';

	function attachment(message) {
		return (node) => {
			node.textContent = message;
		};
	}

	$$renderer.push(`<button>update</button> `);
	Child($$renderer, {});
	$$renderer.push(`<!---->`);
}