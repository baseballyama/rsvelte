import * as $ from 'svelte/internal/server';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myModel = new Array(10000).fill(1).map(() => {
			return { text: getRandomSushi() };
		});

		{
			function header($$renderer) {
				$$renderer.push(`<thead><tr><th>Text</th><th>Index</th></tr></thead>`);
			}

			function vl_slot($$renderer, { item, index }) {
				$$renderer.push(`<tr><td>${$.escape(index)}</td><td>${$.escape(item.text)}</td></tr>`);
			}

			VirtualList($$renderer, {
				items: myModel,
				class: 'list-table',
				style: 'height:600px',
				isTable: true,
				header,
				vl_slot,
				$$slots: { header: true, vl_slot: true }
			});
		}
	});
}