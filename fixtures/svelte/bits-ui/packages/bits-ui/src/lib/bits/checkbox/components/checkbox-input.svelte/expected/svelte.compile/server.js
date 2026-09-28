import * as $ from 'svelte/internal/server';
import { CheckboxInputState } from "../checkbox.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Checkbox_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = CheckboxInputState.create();

		if (inputState.shouldRender) {
			$$renderer.push('<!--[0-->');
			HiddenInput($$renderer, $.spread_props([inputState.props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}