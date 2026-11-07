import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";

export default function HeaderButtonCell($$anchor, $$props) {
	$.push($$props, true);

	function onClick() {
		$$props.onaction && $$props.onaction({
			action: "add-row",
			data: {
				row: {
					firstName: "John",
					lastName: "Smith",
					email: "realemail@gmail.com",
					city: "New York"
				}
			}
		});
	}

	Button($$anchor, {
		type: "secondary",
		icon: 'wxi-plus',
		onclick: onClick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add row');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}