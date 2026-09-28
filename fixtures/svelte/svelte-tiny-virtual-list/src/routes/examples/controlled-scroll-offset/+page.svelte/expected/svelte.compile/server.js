import * as $ from 'svelte/internal/server';
import VirtualList from '$lib/VirtualList.svelte';

export default function _page($$renderer) {
	/** @type {number[]} */
	let rowHeights = [];

	let scrollOffset = void 0;

	randomize();

	function randomize() {
		let newRowHeights = [];

		for (let i = 0; i < 10000; i++) {
			newRowHeights.push(Math.random() * (155 - 50) + 50);
		}

		rowHeights = newRowHeights;
	}

	$.head('1dy3z6r', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Controlled scroll offset | svelte-tiny-virtual-list</title>`);
		});
	});

	$$renderer.push(`<div id="controlled-scroll-offset-example" class="example-page"><h3>Controlled scroll offset</h3> <div class="field label border"><input id="scroll-offset" type="number"${$.attr('value', scrollOffset)}/> <label for="scroll-offset">Scroll to offset...</label></div> <article>`);

	{
		function item($$renderer, { style, index }) {
			$$renderer.push(`<div${$.attr_style(style)} class="virtual-list-row">Item #${$.escape(index)}</div>`);
		}

		VirtualList($$renderer, {
			height: 500,
			width: 'auto',
			itemCount: 10000,
			itemSize: (index) => rowHeights[index],
			scrollOffset,
			item,
			$$slots: { item: true }
		});
	}

	$$renderer.push(`<!----></article></div>`);
}