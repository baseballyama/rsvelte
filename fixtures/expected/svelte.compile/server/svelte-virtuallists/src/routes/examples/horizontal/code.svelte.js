import * as $ from 'svelte/internal/server';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myModel = new Array(10000).fill(1).map((v, i) => {
			return { text: '#' + i + ' ' + getRandomSushi() };
		});

		{
			function vl_slot($$renderer, { item }) {
				$$renderer.push(`<div style="border: 1px solid rgb(204, 204, 204)">${$.escape(item.text)}</div>`);
			}

			VirtualList($$renderer, {
				items: myModel,
				style: 'width:100%',
				isHorizontal: true,
				vl_slot,
				$$slots: { vl_slot: true }
			});
		}
	});
}