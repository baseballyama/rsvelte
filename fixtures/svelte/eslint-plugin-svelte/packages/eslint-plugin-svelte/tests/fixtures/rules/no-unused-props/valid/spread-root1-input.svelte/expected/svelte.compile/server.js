import * as $ from 'svelte/internal/server';
import Test from '$lib/Test.svelte';

export default function Spread_root1_input($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	Test($$renderer, $.spread_props([props]));
}