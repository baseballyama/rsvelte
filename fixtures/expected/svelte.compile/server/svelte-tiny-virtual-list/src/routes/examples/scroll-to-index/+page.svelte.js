import * as $ from 'svelte/internal/server';
import VirtualList from '$lib/VirtualList.svelte';

export default function _page($$renderer) {
	/** @type {number[]} */
	let rowHeights = [];

	let scrollToIndex = void 0;

	/** @type {'start' | 'center' | 'end' | 'auto'} */
	let scrollToAlignment = 'start';

	/** @type {'auto' | 'smooth' | 'instant'} */
	let scrollToBehaviour = 'instant';

	const NUM_ROWS = 10000;

	function randomize() {
		const newRowHeights = [];

		for (let i = 0; i < NUM_ROWS; i++) newRowHeights.push(Math.random() * (155 - 50) + 50);

		rowHeights = newRowHeights;
	}

	randomize();

	$.head('dh3z01', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Scroll to index | svelte-tiny-virtual-list</title>`);
		});
	});

	$$renderer.push(`<div id="scroll-to-index-example" class="example-page"><h3>Scroll to index</h3> <div class="field label border"><input id="scroll-to-index" type="number"${$.attr('value', scrollToIndex)}/> <label for="scroll-to-index">Scroll to index...</label></div> <div class="field label suffix border">`);

	$$renderer.select({ id: 'alignment', value: scrollToAlignment }, ($$renderer) => {
		$$renderer.option({ value: 'start' }, ($$renderer) => {
			$$renderer.push(`start`);
		});

		$$renderer.option({ value: 'center' }, ($$renderer) => {
			$$renderer.push(`center`);
		});

		$$renderer.option({ value: 'end' }, ($$renderer) => {
			$$renderer.push(`end`);
		});

		$$renderer.option({ value: 'auto' }, ($$renderer) => {
			$$renderer.push(`auto`);
		});
	});

	$$renderer.push(` <label for="alignment">Alignment</label> <i>arrow_drop_down</i></div> <div class="field label suffix border">`);

	$$renderer.select({ id: 'behaviour', value: scrollToBehaviour }, ($$renderer) => {
		$$renderer.option({ value: 'auto' }, ($$renderer) => {
			$$renderer.push(`auto`);
		});

		$$renderer.option({ value: 'smooth' }, ($$renderer) => {
			$$renderer.push(`smooth`);
		});

		$$renderer.option({ value: 'instant' }, ($$renderer) => {
			$$renderer.push(`instant`);
		});
	});

	$$renderer.push(` <label for="behaviour">Behaviour</label> <i>arrow_drop_down</i></div> <article>`);

	{
		function item($$renderer, { style, index }) {
			$$renderer.push(`<div${$.attr_style(style)}${$.attr_class('virtual-list-row', void 0, { 'highlighted': index === scrollToIndex })}>Item #${$.escape(index)}</div>`);
		}

		VirtualList($$renderer, {
			height: 500,
			width: 'auto',
			itemCount: 10000,
			itemSize: (index) => rowHeights[index],
			scrollToIndex,
			scrollToAlignment,
			scrollToBehaviour,
			item,
			$$slots: { item: true }
		});
	}

	$$renderer.push(`<!----></article></div>`);
}