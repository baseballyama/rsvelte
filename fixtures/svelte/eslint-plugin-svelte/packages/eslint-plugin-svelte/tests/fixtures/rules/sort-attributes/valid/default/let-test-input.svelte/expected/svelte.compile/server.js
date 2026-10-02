import * as $ from 'svelte/internal/server';
import FancyList from './FancyListFancyList.svelte';

export default function Let_test_input($$renderer) {
	let items = [1, 2, 3];

	FancyList($$renderer, {
		items,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { a: thing, b: thing2 }) => {
				$$renderer.push(`<div>${$.escape(thing.text)}</div>`);
			}
		}
	});
}