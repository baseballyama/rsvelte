import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let active = true;
	let data = { example: 'This is some example data' };

	function log(data) {
		console.log('should fire once');

		return data;
	}

	$$renderer.push(`<button>Hide</button> `);

	if (active) {
		$$renderer.push('<!--[0-->');
		Child($$renderer, { data: log(data) });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}