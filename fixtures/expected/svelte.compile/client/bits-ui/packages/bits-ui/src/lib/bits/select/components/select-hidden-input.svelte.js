import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { SelectHiddenInputState } from "../select.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Select_hidden_input($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15);
	const hiddenInputState = SelectHiddenInputState.create({ value: boxWith(() => value()) });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HiddenInput($$anchor, $.spread_props(() => hiddenInputState.props, {
				get autocomplete() {
					return $$props.autocomplete;
				},

				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				}
			}));
		};

		$.if(node, ($$render) => {
			if (hiddenInputState.shouldRender) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}