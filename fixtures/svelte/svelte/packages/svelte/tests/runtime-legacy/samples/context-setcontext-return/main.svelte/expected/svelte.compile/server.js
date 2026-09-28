import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const a = {};
		const b = setContext('foo', a);

		$$renderer.push(`<div>${$.escape(a === b)}</div>`);
	});
}