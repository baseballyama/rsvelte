import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';
import { slide } from 'svelte/transition';

export default function Nested_1($$renderer, $$props) {
	let { depth } = $$props;

	$$renderer.push(`<div${$.attr_class(`level-${$.stringify(depth)}`)}>`);

	if (depth > 0) {
		$$renderer.push('<!--[0-->');
		Nested($$renderer, { depth: depth - 1 });
	} else {
		$$renderer.push(`<!--[-1--><div style="height: 100px">leaf</div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}