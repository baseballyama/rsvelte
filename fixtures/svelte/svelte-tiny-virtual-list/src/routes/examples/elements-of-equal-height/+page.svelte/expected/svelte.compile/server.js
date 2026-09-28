import * as $ from 'svelte/internal/server';
import VirtualList from '$lib/VirtualList.svelte';

export default function _page($$renderer) {
	let itemSize = 50;

	$.head('1pqhz2b', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Elements of equal height | svelte-tiny-virtual-list</title>`);
		});
	});

	$$renderer.push(`<div id="elements-of-equal-height-example" class="example-page"><h3>Elements of equal height</h3> <div class="range-field"><label for="item-size">Item size</label> <div class="slider"><input id="item-size" type="range" step="5" min="50" max="155"${$.attr('value', itemSize)}/> <span></span></div></div> <article>`);

	{
		function item($$renderer, { style, index }) {
			$$renderer.push(`<div${$.attr_style(style)} class="virtual-list-row">Item #${$.escape(index)}</div>`);
		}

		VirtualList($$renderer, {
			height: 500,
			width: 'auto',
			itemCount: 100000,
			itemSize,
			item,
			$$slots: { item: true }
		});
	}

	$$renderer.push(`<!----></article></div>`);
}