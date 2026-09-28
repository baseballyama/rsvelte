import * as $ from 'svelte/internal/server';
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";
import { SwitchInputState } from "../switch.svelte.js";

export default function Switch_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const inputState = SwitchInputState.create();

		if (inputState.shouldRender) {
			$$renderer.push('<!--[0-->');
			HiddenInput($$renderer, $.spread_props([inputState.props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}