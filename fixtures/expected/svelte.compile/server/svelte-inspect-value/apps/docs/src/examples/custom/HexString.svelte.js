import * as $ from 'svelte/internal/server';
import { CustomLine } from 'svelte-inspect-value';

export default function HexString($$renderer, $$props) {
	// extra props
	let { value, showString = true, $$slots, $$events, ...rest } = $$props;

	CustomLine($$renderer, $.spread_props([
		{ value },
		rest,
		{
			children: ($$renderer) => {
				$$renderer.push(`<div class="color svelte-1x88h7k"${$.attr_style(`background-color: ${$.stringify(value)};`)}${$.attr('title', value)}>`);

				if (showString) {
					$$renderer.push(`<!--[0--><div class="text svelte-1x88h7k">${$.escape(value)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		}
	]));
}