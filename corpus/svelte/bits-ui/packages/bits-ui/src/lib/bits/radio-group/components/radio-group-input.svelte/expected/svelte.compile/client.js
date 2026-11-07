import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";
import { RadioGroupInputState } from "../radio-group.svelte.js";

export default function Radio_group_input($$anchor, $$props) {
	$.push($$props, true);

	const inputState = RadioGroupInputState.create();
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