import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from '$lib/Test.svelte';

export default function Spread_nested2_input($$anchor, $$props) {
	Test($$anchor, $.spread_props(
		{
			get a() {
				return $$props.a;
			}
		},
		() => $$props.b
	));
}