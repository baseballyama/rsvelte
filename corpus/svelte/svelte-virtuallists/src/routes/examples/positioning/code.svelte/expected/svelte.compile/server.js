import * as $ from 'svelte/internal/server';
import { ALIGNMENT, SCROLL_BEHAVIOR } from '$lib';
import { VirtualList } from 'svelte-virtuallists';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myModel = new Array(10000);

		// used for the positioning pointers
		let start = 0;

		let end = 0;
		let scrollToAlignment = ALIGNMENT.AUTO;
		let scrollToBehaviour = SCROLL_BEHAVIOR.SMOOTH;
		let szCalculator = void 0;

		// holds randomized sizes
		let randSizes;

		function handleVisualRangeChange(event) {
			start = event.start;
			end = event.end;
		}

		let scrollToProps = {};

		function updateScrollToProps(key, value) {
			if (key === 'scrollToIndex') {
				scrollToProps.scrollToIndex = value;
				scrollToProps.scrollToOffset = undefined;
			} else if (key === 'scrollToOffset') {
				scrollToProps.scrollToOffset = value;
				scrollToProps.scrollToIndex = undefined;
			}
		}

		function randomizeSize() {
			randSizes = new Array(myModel.length);

			for (let i = 0; i < randSizes.length; i++) {
				randSizes[i] = Math.round(Math.random() * 65 + 30);
			}

			szCalculator = (_index, _item) => randSizes[_index];
		}

		function sameSize() {
			szCalculator = () => 25;
		}

		function randomizeContent() {
			for (let i = 0; i < myModel.length; i++) {
				myModel[i] = { text: Math.floor(Math.random() * myModel.length) }; // Random number between 0 and 9999
			}
		}

		function stripItemsBy10() {
			for (let i = 0; i < 10; i++) myModel.pop();
		}

		randomizeContent();
		sameSize();
		$$renderer.push(`<div class="actions"><div class="select"><span>Scroll to row index <input id="index" type="number" placeholder="pick an index..." class="input"${$.attr('value', scrollToProps.scrollToIndex)}/></span></div> <div class="select"><span>Scroll to pixel offset <input id="offset" type="number" placeholder="pick an offset..." class="input"${$.attr('value', scrollToProps.scrollToOffset)}/></span></div> <div class="select"><span>Alignment `);

		$$renderer.select({ id: 'alignment', value: scrollToAlignment }, ($$renderer) => {
			$$renderer.option({ value: 'auto' }, ($$renderer) => {
				$$renderer.push(`auto`);
			});

			$$renderer.option({ value: 'start' }, ($$renderer) => {
				$$renderer.push(`start`);
			});

			$$renderer.option({ value: 'center' }, ($$renderer) => {
				$$renderer.push(`center`);
			});

			$$renderer.option({ value: 'end' }, ($$renderer) => {
				$$renderer.push(`end`);
			});
		});

		$$renderer.push(`</span></div> <div class="select"><span>Behaviour `);

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

		$$renderer.push(`</span></div></div> <div style="font-weight: bold"><span>Visible Area: start</span> <span>${$.escape(start)}</span> - <span>end</span> <span>${$.escape(end)}</span></div> `);

		{
			function vl_slot($$renderer, { index, item, size }) {
				$$renderer.push(`<div${$.attr_style(`border: 1px solid rgb(204, 204, 204); line-height: ${$.stringify(size)}px;`)}${$.attr_class('svelte-1rg2xyt', void 0, { 'highlighted': index === scrollToProps.scrollToIndex })}>#${$.escape(index)}
      ${$.escape(item.text)}</div>`);
			}

			VirtualList($$renderer, $.spread_props([
				{ items: myModel, style: 'height:500px' },
				scrollToProps,
				{
					scrollToAlignment,
					scrollToBehaviour,
					sizingCalculator: szCalculator,
					onVisibleRangeUpdate: handleVisualRangeChange,
					vl_slot,
					$$slots: { vl_slot: true }
				}
			]));
		}

		$$renderer.push(`<!----> <div class="actions"><button class="button">Randomize row heights</button> <button class="button">Same row heights</button> <button class="button">Randomize content</button> <button class="button">array size -10</button></div>`);
	});
}