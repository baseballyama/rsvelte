import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { format } from 'd3-format';
import QuadTree from './QuadTree.percent-range.html.svelte';

export default function SharedTooltip_percent_range_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, width, yScale, config } = getContext('LayerCake');
		const commas = format(',');
		const titleCase = (d) => d.replace(/^\w/, (w) => w.toUpperCase());

		/**
		 * @typedef {Object} Props
		 * @property {Function} [formatTitle=d => d] - A function to format the tooltip title, which is `$config.x`.
		 * @property {Function} [formatKey = d => titleCase(d)] - A function to format the series name.
		 * @property {Function} [formatValue = d => (isNaN(+d) ? d : commas(d))] - A function to format the value.
		 * @property {number} [offset=-20] - A y-offset from the hover point, in pixels.
		 * @property {Array} [dataset] - The dataset to work off of—defaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format.
		 */
		/** @type {Props} */
		let {
			formatTitle = (d) => d,
			formatKey = (d) => titleCase(d),
			formatValue = (d) => isNaN(+d) ? d : commas(d),
			offset = -20,
			dataset
		} = $$props;

		const w = 150;
		const w2 = w / 2;

		/* --------------------------------------------
		 * Sort the keys by the highest value
		 */
		function sortResult(result) {
			if (Object.keys(result).length === 0) return [];

			const rows = Object.keys(result).filter((d) => d !== $.store_get($$store_subs ??= {}, '$config', config).x).map((key) => {
				return { key, value: result[key] };
			}).sort((a, b) => b.value - a.value);

			return rows;
		}

		{
			function children($$renderer, { x, y, visible, found, e }) {
				const foundSorted = sortResult(found);

				if (visible === true) {
					$$renderer.push(`<!--[0--><div${$.attr_style(`left:${$.stringify(x / 100 * $.store_get($$store_subs ??= {}, '$width', width))}px;`)} class="line svelte-1c6q2af"></div> <div class="tooltip svelte-1c6q2af"${$.attr_style(` width:150px; display: ${visible ? 'block' : 'none'}; top:calc(${$.stringify($.store_get($$store_subs ??= {}, '$yScale', yScale)(foundSorted[0].value))}% + ${$.stringify(offset)}px); left:${$.stringify(Math.min(Math.max(w2, x / 100 * $.store_get($$store_subs ??= {}, '$width', width)), $.store_get($$store_subs ??= {}, '$width', width) - w2))}px;`)}><div class="title svelte-1c6q2af">${$.escape(formatTitle(found[$.store_get($$store_subs ??= {}, '$config', config).x]))}</div> <!--[-->`);

					const each_array = $.ensure_array_like(foundSorted);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let row = each_array[$$index];

						$$renderer.push(`<div class="row"><span class="key svelte-1c6q2af">${$.escape(formatKey(row.key))}:</span> ${$.escape(formatValue(row.value))}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			QuadTree($$renderer, {
				dataset: dataset || $.store_get($$store_subs ??= {}, '$data', data),
				y: 'x',
				children,
				$$slots: { default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}