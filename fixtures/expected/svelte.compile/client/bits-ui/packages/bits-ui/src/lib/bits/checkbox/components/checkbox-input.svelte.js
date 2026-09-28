import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CheckboxInputState } from "../checkbox.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Checkbox_input($$anchor, $$props) {
	$.push($$props, true);

	const inputState = CheckboxInputState.create();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HiddenInput($$anchor, $.spread_props(() => inputState.props));
		};

		$.if(node, ($$render) => {
			if (inputState.shouldRender) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}