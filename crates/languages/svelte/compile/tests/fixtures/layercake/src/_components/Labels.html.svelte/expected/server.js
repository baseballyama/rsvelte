import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Labels_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { xGet, yGet } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {Array<Object>} labels - An array of objects that contain a field containing text label and data fields.
		 * @property {Function} getLabelName - An accessor function to return the label field on your objects in the `labels` array.
		 * @property {Function} [formatLabelName] - An optional formatting function.
		 */
		/** @type {Props} */
		let { labels, getLabelName, formatLabelName = (d) => d } = $$props;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(labels);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<div class="label svelte-1ajgon7"${$.attr_style(` top:${$.stringify($.store_get($$store_subs ??= {}, '$yGet', yGet)(d))}px; left:${$.stringify($.store_get($$store_subs ??= {}, '$xGet', xGet)(d))}px; `)}>${$.escape(formatLabelName(getLabelName(d)))}</div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}