import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { ID } from './Nested.svelte';

export default function Leaf($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const name = getContext('test');

		$$renderer.push(`<div>${$.escape(name)}</div>`);
	});
}