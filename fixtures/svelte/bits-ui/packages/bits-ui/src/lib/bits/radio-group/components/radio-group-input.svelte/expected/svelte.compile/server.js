import * as $ from 'svelte/internal/server';
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";
import { RadioGroupInputState } from "../radio-group.svelte.js";

export default function Radio_group_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = RadioGroupInputState.create();

		if (inputState.shouldRender) {
			$$renderer.push('<!--[0-->');
			HiddenInput($$renderer, $.spread_props([inputState.props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}