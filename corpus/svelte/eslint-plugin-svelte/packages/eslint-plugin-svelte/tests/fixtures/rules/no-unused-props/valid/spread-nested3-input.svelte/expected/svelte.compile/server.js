import * as $ from 'svelte/internal/server';
import Test from '$lib/Test.svelte';

export default function Spread_nested3_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		Test($$renderer, $.spread_props([props.a]));
	});
}