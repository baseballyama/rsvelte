import * as $ from 'svelte/internal/server';
import Test from '$lib/Test.svelte';

export default function Spread_nested2_input($$renderer, $$props) {
	let { a, b } = $$props;

	Test($$renderer, $.spread_props([{ a }, b]));
}