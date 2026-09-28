import * as $ from 'svelte/internal/server';
import { CustomLine } from 'svelte-inspect-value';

export default function CustomNumber($$renderer, $$props) {
	let { value, $$slots, $$events, ...rest } = $$props;

	CustomLine($$renderer, $.spread_props([
		{ value },
		rest,
		{
			children: ($$renderer) => {
				$$renderer.push(`<span class="value number svelte-18s35c2">${$.escape(value)}</span>`);
			},
			$$slots: { default: true }
		}
	]));
}