import * as $ from 'svelte/internal/server';
import FancyList from './FancyList.svelte';

export default function Slot_test_input($$renderer) {
	const items = [1, 2, 3];

	FancyList($$renderer, {
		items,
		$$slots: {
			item: ($$renderer, { item }) => {
				$$renderer.push(`<div${$.attr('id', item.id)} slot="item">${$.escape(item.text)}</div>`);
			},

			footer: ($$renderer) => {
				$$renderer.push(`<p class="footer" slot="footer">Footer</p>`);
			}
		}
	});
}