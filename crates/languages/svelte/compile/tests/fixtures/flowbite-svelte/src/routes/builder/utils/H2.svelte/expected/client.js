import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading } from "$lib";
import { h2Cls } from "./theme";

export default function H2($$anchor, $$props) {
	$.push($$props, true);

	const base = $.derived(() => h2Cls({ className: $$props.class }));

	Heading($$anchor, {
		tag: 'h2',
		get class() {
			return $.get(base);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}