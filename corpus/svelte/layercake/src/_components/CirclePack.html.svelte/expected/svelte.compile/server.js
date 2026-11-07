import * as $ from 'svelte/internal/server';
import { stratify, pack, hierarchy } from 'd3-hierarchy';
import { getContext } from 'svelte';
import { format } from 'd3-format';

export default function CirclePack_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const titleCase = (d) => d.replace(/^\w/, (w) => w.toUpperCase());
		const commas = format(',');
		const { width, height, data } = getContext('LayerCake');

		/** @typedef {import('d3-hierarchy').HierarchyNode<any>} HierarchyNode */
		/**
		 * @typedef {Object} Props
		 * @property {string} [idKey='id'] - The key on each object where the id value lives.
		 * @property {string} [parentKey] - Set this if you want to define one parent circle. This will give you a [nested](https://layercake.graphics/example/CirclePackNested) graphic versus a [grouping of circles](https://layercake.graphics/example/CirclePack).
		 * @property {string} [valueKey='value'] - The key on each object where the data value lives.
		 * @property {Function} [labelVisibilityThreshold=r => r> 25] - By default, only show the text inside a circle if its radius exceeds a certain size. Provide your own function for different behavior.
		 * @property {string} [fill='#fff'] - The circle's fill color.
		 * @property {string} [stroke='#999'] - The circle's stroke color.
		 * @property {number} [strokeWidth=1] - The circle's stroke width, in pixels.
		 * @property {string} [textColor='#333'] - The label text color.
		 * @property {string} [textStroke='#000'] - The label text's stroke color.
		 * @property {number} [textStrokeWidth=0] - The label text's stroke width, in pixels.
		 * @property {(a: HierarchyNode, b: HierarchyNode) => number} [sortBy=(a, b) => b.value - a.value] - The order in which circle's are drawn. Sorting on the `depth` key is also a popular choice.
		 * @property {number} [spacing=0] - Whitespace padding between each circle, in pixels.
		 */
		/** @type {Props} */
		let {
			idKey = 'id',
			parentKey,
			valueKey = 'value',
			labelVisibilityThreshold = (r) => r > 25,
			fill = '#fff',
			stroke = '#999',
			strokeWidth = 1,
			textColor = '#333',
			textStroke = '#000',
			textStrokeWidth = 0,
			sortBy = (a, b) => b.value - a.value,
			spacing = 0
		} = $$props;

		/* --------------------------------------------
		 * This component will automatically group your data
		 * into one group if no `parentKey` was passed in.
		 * Stash $data here so we can add our own parent
		 * if there's no `parentKey`
		 */
		let parent = $.derived(() => parentKey !== undefined ? {} : { [idKey]: 'all' });

		let dataset = $.derived(() => parentKey !== undefined
			? $.store_get($$store_subs ??= {}, '$data', data)
			: [...$.store_get($$store_subs ??= {}, '$data', data), parent()]);

		let stratifier = $.derived(() => stratify().id((d) => d[idKey]).parentId((d) => {
			if (d[idKey] === parent()[idKey]) return '';
			if (parentKey === undefined) return parent()[idKey];

			return d[parentKey];
		}));

		let descendants = $.derived(() => pack().size([
			$.store_get($$store_subs ??= {}, '$width', width),
			$.store_get($$store_subs ??= {}, '$height', height)
		]).padding(spacing)(hierarchy(stratifier()(dataset())).sum((d) => {
			return d.data[valueKey] || 1;
		}).sort(sortBy)).descendants());

		$$renderer.push(`<div class="circle-pack svelte-1rwl0z1"${$.attr('data-has-parent-key', parentKey !== undefined)}><!--[-->`);

		const each_array = $.ensure_array_like(descendants());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<div class="circle-group svelte-1rwl0z1"${$.attr('data-id', d.data.id)}${$.attr('data-visible', labelVisibilityThreshold(d.r))}><div class="circle svelte-1rwl0z1"${$.attr_style('', {
				left: `${$.stringify(d.x)}px`,
				top: `${$.stringify(d.y)}px`,
				width: `${$.stringify(d.r * 2)}px`,
				height: `${$.stringify(d.r * 2)}px`,
				'background-color': fill,
				border: `${$.stringify(strokeWidth)}px solid ${$.stringify(stroke)}`
			})}></div> <div class="text-group svelte-1rwl0z1"${$.attr_style(` color:${$.stringify(textColor)}; text-shadow: -${$.stringify(textStrokeWidth)}px -${$.stringify(textStrokeWidth)}px 0 ${$.stringify(textStroke)}, ${$.stringify(textStrokeWidth)}px -${$.stringify(textStrokeWidth)}px 0 ${$.stringify(textStroke)}, -${$.stringify(textStrokeWidth)}px ${$.stringify(textStrokeWidth)}px 0 ${$.stringify(textStroke)}, ${$.stringify(textStrokeWidth)}px ${$.stringify(textStrokeWidth)}px 0 ${$.stringify(textStroke)}; left:${$.stringify(d.x)}px; top:${$.stringify(d.y - (labelVisibilityThreshold(d.r) ? 0 : d.r + 4))}px; `)}><div class="text svelte-1rwl0z1">${$.escape(titleCase(d.data.id))}</div> `);

			if (d.data.data[valueKey]) {
				$$renderer.push(`<!--[0--><div class="text value svelte-1rwl0z1">${$.escape(commas(d.data.data[valueKey]))}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}