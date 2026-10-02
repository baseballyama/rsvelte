import * as $ from 'svelte/internal/server';
import { CustomLine } from 'svelte-inspect-value';

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
						$$renderer.push(`<!--[0--><div class="color svelte-17r1ghm"${$.attr_style(`background-color: ${$.stringify(value)};`)}${$.attr('title', value)}>`);

						if (showString) {
							$$renderer.push(`<!--[0--><div class="text svelte-17r1ghm">${$.escape(value)}</div>`);
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