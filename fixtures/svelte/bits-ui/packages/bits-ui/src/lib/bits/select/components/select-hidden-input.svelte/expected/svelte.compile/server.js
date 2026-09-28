import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { SelectHiddenInputState } from "../select.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Select_hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, autocomplete } = $$props;
		const hiddenInputState = SelectHiddenInputState.create({ value: boxWith(() => value) });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (hiddenInputState.shouldRender) {
				$$renderer.push('<!--[0-->');

				HiddenInput($$renderer, $.spread_props([
					hiddenInputState.props,
					{
						autocomplete,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}