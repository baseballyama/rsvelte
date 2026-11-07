import * as $ from 'svelte/internal/server';
import { CustomLine } from '$lib/index.js';

export default function HexString($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// extra props
		let { value, showString = true, $$slots, $$events, ...rest } = $$props;

		let isColor = $.derived(() => value.startsWith('#'));

		CustomLine($$renderer, $.spread_props([
			{ value },
			rest,
			{
				type: isColor() ? '' : 'string',
				children: ($$renderer) => {
					if (isColor()) {
						$$renderer.push(`<!--[0--><div class="color svelte-1rcsyxz"${$.attr_style(`background-color: ${$.stringify(value)};`)}${$.attr('title', value)}>`);

						if (showString) {
							$$renderer.push(`<!--[0--><div class="text svelte-1rcsyxz">${$.escape(value)}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><span class="value string">'${$.escape(value)}'</span>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}