import * as $ from 'svelte/internal/server';
import { RatingGroupHiddenInputState } from "../rating-group.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Rating_group_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = RatingGroupHiddenInputState.create();

		if (inputState.shouldRender) {
			$$renderer.push('<!--[0-->');
			HiddenInput($$renderer, $.spread_props([inputState.props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}