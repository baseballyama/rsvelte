import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	let data = { value: 'hello' };
	const setData = () => data = { value: 'hello' };
	const clearData = () => data = undefined;

	$$renderer.push(`<button>Set data</button> <button>Clear data</button> `);

	if (data) {
		$$renderer.push('<!--[0-->');
		Child($$renderer, { data });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}