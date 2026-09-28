import * as $ from 'svelte/internal/server';
import { TimeFieldHiddenInputState } from "../time-field.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Time_field_hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const hiddenInputState = TimeFieldHiddenInputState.create();

		if (hiddenInputState.shouldRender) {
			$$renderer.push('<!--[0-->');
			HiddenInput($$renderer, $.spread_props([hiddenInputState.props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}