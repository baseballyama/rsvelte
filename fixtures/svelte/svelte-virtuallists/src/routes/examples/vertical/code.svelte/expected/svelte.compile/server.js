import * as $ from 'svelte/internal/server';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myModel = new Array(10000).fill(1).map((v, i) => {
			return { text: '#' + i + ' ' + getRandomSushi() };
		});

		$$renderer.push(`<div class="gradient myStyle svelte-1gkukco">`);

		{
			function vl_slot($$renderer, { item }) {
				$$renderer.push(`<div class="slotStyle svelte-1gkukco">${$.escape(item.text)}</div>`);
			}

			VirtualList($$renderer, {
				items: myModel,
				style: 'height:600px',
				vl_slot,
				$$slots: { vl_slot: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}