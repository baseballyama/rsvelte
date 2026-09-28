import * as $ from 'svelte/internal/server';
import BaseNotification from './BaseNotification.svelte';

export default function Toast($$renderer, $$props) {
	let { message, $$slots, $$events, ...rest } = $$props;

	BaseNotification($$renderer, $.spread_props([
		rest,
		{
			children: ($$renderer) => {
				$$renderer.push(`<p>${$.escape(message)}</p>`);
			},
			$$slots: { default: true }
		}
	]));
}