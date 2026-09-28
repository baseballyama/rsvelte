import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let options = [{ a: 1, v: 'a1' }, { a: 2, v: 'a2' }, { a: 3, v: 'a3' }];

	$$renderer.push(`<button>reverse</button> `);
	Child($$renderer, { options, labelKey: 'a', valueKey: 'v' });
	$$renderer.push(`<!---->`);
}