import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function ChildComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = getContext('foo');

		$$renderer.push(`<div>Value in child component: ${$.escape(value)}</div>`);
	});
}