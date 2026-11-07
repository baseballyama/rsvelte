import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function Goto_nullish_resolved_pathname_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { one, two, three } = $$props;

		goto(one);
		goto(two);
		goto(three);
	});
}