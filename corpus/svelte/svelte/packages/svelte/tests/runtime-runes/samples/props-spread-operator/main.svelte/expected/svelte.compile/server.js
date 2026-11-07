import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const numbers = new SvelteSet([0, 1, 2]);

		$$renderer.push(`<button>+1</button> `);
		Child($$renderer, { numbers: [...numbers] });
		$$renderer.push(`<!---->`);
	});
}