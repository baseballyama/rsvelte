import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateFieldHiddenInputState } from "../date-field.svelte.js";
import HiddenInput from "$lib/bits/utilities/hidden-input.svelte";

export default function Date_field_hidden_input($$anchor, $$props) {
	$.push($$props, true);

	const hiddenInputState = DateFieldHiddenInputState.create();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HiddenInput($$anchor, $.spread_props(() => hiddenInputState.props));
		};

		$.if(node, ($$render) => {
			if (hiddenInputState.shouldRender) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}