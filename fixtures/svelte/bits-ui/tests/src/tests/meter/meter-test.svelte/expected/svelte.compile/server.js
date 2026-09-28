import * as $ from 'svelte/internal/server';
import { Meter } from "bits-ui";

export default function Meter_test($$renderer, $$props) {
	let { value = 0, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<main>`);

	if (Meter.Root) {
		$$renderer.push('<!--[-->');

		Meter.Root($$renderer, $.spread_props([
			{
				'aria-label': 'battery remaining',
				'data-testid': 'root',
				value
			},
			restProps
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button data-testid="binding">${$.escape(value)}</button></main>`);
}