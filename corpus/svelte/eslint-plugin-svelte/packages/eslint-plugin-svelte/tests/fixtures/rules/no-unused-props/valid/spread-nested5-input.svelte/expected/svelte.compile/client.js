import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from '$lib/Test.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Spread_nested5_input($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	console.log(...props);
	Test($$anchor, {});
}