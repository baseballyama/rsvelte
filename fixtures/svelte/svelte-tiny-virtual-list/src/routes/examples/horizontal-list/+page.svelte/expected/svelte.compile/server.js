import * as $ from 'svelte/internal/server';
import VirtualList from '$lib/VirtualList.svelte';

export default function _page($$renderer) {
	let width = 500;

	$.head('61hm4s', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Horizontal list | svelte-tiny-virtual-list</title>`);
		});
	});

	$$renderer.push(`<div id="horizontal-list-example" class="example-page"><h3>Horizontal list</h3> <article><div class="row scroll">`);

	{
		function item($$renderer, { style, index }) {
			$$renderer.push(`<div${$.attr_style(style)} class="virtual-list-col">Item #${$.escape(index)}</div>`);
		}

		VirtualList($$renderer, {
			height: '200px',
			width,
			scrollDirection: 'horizontal',
			itemCount: 100000,
			itemSize: 150,
			item,
			$$slots: { item: true }
		});
	}

	$$renderer.push(`<!----></div></article></div>`);
}