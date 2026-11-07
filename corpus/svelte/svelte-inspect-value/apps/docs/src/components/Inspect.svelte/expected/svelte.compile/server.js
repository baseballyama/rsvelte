import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';
import { globalOpts } from './global-opts/globalopts.svelte';

export default function Inspect_1($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	let fwd = $.derived(() => ({ ...globalOpts, ...props }));

	Inspect($$renderer, $.spread_props([fwd(), { class: 'not-content mt' }]));
}