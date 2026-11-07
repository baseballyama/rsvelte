import * as $ from 'svelte/internal/server';
import { CustomLine } from '$lib/index.js';

export default function CustomNumber($$renderer, $$props) {
	let { value, $$slots, $$events, ...rest } = $$props;

	CustomLine($$renderer, $.spread_props([
		{ value },
		rest,
		{
			children: ($$renderer) => {
				$$renderer.push(`<span class="value number svelte-13mfqu5">${$.escape(value)}</span>`);
			},
			$$slots: { default: true }
		}
	]));
}