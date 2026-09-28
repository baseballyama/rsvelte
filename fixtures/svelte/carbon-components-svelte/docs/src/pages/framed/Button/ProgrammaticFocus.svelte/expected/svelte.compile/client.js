import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ProgrammaticFocus($$anchor) {
	let ref;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		get ref() {
			return ref;
		},

		set ref($$value) {
			ref = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		kind: 'ghost',
		$$events: {
			click: () => {
				ref?.focus();
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Click to focus the Primary button');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}