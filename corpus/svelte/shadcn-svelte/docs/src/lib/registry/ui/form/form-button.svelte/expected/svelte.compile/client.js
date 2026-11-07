import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Form_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	Button($$anchor, $.spread_props({ type: 'submit' }, () => restProps, {
		get ref() {
			return ref();
		},

		set ref($$value) {
			ref($$value);
		}
	}));

	$.pop();
}