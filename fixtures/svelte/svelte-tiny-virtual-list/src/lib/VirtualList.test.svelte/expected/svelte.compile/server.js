import * as $ from 'svelte/internal/server';
import VirtualList from './VirtualList.svelte';

export default function VirtualList_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: { id: number, label: string }[], scrollOffset: number, onItemRender: (index: number) => void }} */
		let { data = [], scrollOffset, onItemRender = () => {} } = $$props;

		$$renderer.push(`<div style="height: 400px; width: 400px;">`);

		{
			function item($$renderer, { index, style }) {
				$$renderer.push(`<!---->${$.escape((onItemRender(index), ''))} <div${$.attr_style(style)}>${$.escape(data[index]?.label)}</div>`);
			}

			VirtualList($$renderer, {
				height: '200px',
				width: 300,
				scrollDirection: 'horizontal',
				itemCount: data.length,
				itemSize: 50,
				scrollOffset,
				item,
				$$slots: { item: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}