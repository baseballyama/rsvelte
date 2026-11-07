import * as $ from 'svelte/internal/server';
import VirtualList from '$lib/VirtualList.svelte';

export default function _page($$renderer) {
	/** @type {number[]} */
	let rowHeights = [];

	randomize();

	function randomize() {
		let newRowHeights = [];

		for (let i = 0; i < 10000; i++) {
			newRowHeights.push(Math.random() * (155 - 50) + 50);
		}

		rowHeights = newRowHeights;
	}

	$.head('140sny6', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Variable heights | svelte-tiny-virtual-list</title>`);
		});
	});

	$$renderer.push(`<div id="variable-heights-example" class="example-page"><h3>Variable heights</h3> <button class="responsive margin"><i aria-hidden="true">shuffle</i> <span>Randomize heights</span></button> <article>`);

	{
		function item($$renderer, { style, index }) {
			$$renderer.push(`<div${$.attr_style(style)} class="virtual-list-row">Item #${$.escape(index)}</div>`);
		}

		VirtualList($$renderer, {
			height: 500,
			width: 'auto',
			itemCount: 10000,
			itemSize: rowHeights,
			item,
			$$slots: { item: true }
		});
	}

	$$renderer.push(`<!----></article></div>`);
}