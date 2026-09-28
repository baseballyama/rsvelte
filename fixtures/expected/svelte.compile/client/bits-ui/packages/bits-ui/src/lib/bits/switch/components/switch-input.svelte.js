import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";
import { SwitchInputState } from "../switch.svelte.js";

export default function Switch_input($$anchor, $$props) {
	$.push($$props, true);

	const inputState = SwitchInputState.create();
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