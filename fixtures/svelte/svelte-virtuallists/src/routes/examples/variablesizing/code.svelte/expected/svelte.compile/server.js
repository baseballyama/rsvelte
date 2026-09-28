import * as $ from 'svelte/internal/server';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const myModel = new Array(10000).fill(1).map(() => {
			return { text: getRandomSushi() };
		});

		function randomize() {
			calculator = () => Math.round(Math.random() * (155 - 30) + 30);
		}

		function sameSize() {
			calculator = () => 25;
		}

		// @ts-expect-error undefined
		let calculator = void 0;

		randomize();
		$$renderer.push(`<h2>Horizontal</h2> `);

		{
			function vl_slot($$renderer, { index, item, size }) {
				$$renderer.push(`<div${$.attr_style(`border: 1px solid rgb(204, 204, 204); width: ${$.stringify(size)}px;`)}>#${$.escape(index)}
      ${$.escape(item.text)}</div>`);
			}

			VirtualList($$renderer, {
				items: myModel,
				style: 'width:100%',
				isHorizontal: true,
				sizingCalculator: calculator,
				vl_slot,
				$$slots: { vl_slot: true }
			});
		}

		$$renderer.push(`<!----> <h2>Vertical</h2> `);

		{
			function vl_slot($$renderer, { index, item, size }) {
				$$renderer.push(`<div${$.attr_style(`border: 1px solid rgb(204, 204, 204); line-height: ${$.stringify(size)}px;`)}>#${$.escape(index)}
      ${$.escape(item.text)}</div>`);
			}

			VirtualList($$renderer, {
				items: myModel,
				style: 'height:600px',
				sizingCalculator: calculator,
				vl_slot,
				$$slots: { vl_slot: true }
			});
		}

		$$renderer.push(`<!----> <div class="actions"><button class="button">Randomize row heights</button> <button class="button">Same row heights</button></div>`);
	});
}