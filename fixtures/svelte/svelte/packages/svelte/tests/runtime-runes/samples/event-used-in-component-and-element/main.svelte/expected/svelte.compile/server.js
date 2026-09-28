import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';

export default function Main($$renderer) {
	let count = 0;

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button>Count: ${$.escape(count)}</button> `);
	Sub($$renderer, { onClick: increment });
	$$renderer.push(`<!---->`);
}