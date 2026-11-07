import * as $ from 'svelte/internal/server';
import { CustomExpandable } from '$lib/index.js';

export default function ExpandableNumber($$renderer, $$props) {
	let { value, $$slots, $$events, ...rest } = $$props;
	let entries = $.derived(() => Object.entries({ base: value, timesTwo: value * 2, timesThree: value * 3 }));

	{
		function valuePreview($$renderer) {
			$$renderer.push(`<!---->${$.escape(value)}`);
		}

		CustomExpandable($$renderer, $.spread_props([
			{ value },
			rest,
			{
				length: entries().length,
				showLength: false,
				keepPreviewOnExpand: true,
				valuePreview,
				children: ($$renderer) => {
					$$renderer.push(`<!---->multiples: <ul><!--[-->`);

					const each_array = $.ensure_array_like(entries());

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let [k, v] = each_array[i];

						$$renderer.push(`<li>${$.escape(k)}: ${$.escape(v)}</li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				},
				$$slots: { valuePreview: true, default: true }
			}
		]));
	}
}