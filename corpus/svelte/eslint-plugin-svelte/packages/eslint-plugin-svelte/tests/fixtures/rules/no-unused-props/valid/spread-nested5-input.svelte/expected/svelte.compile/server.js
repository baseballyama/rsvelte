import * as $ from 'svelte/internal/server';
import Test from '$lib/Test.svelte';

export default function Spread_nested5_input($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	console.log(...props);
	Test($$renderer, {});
}