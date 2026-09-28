import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MenuButton, MenuItem } from "carbon-components-svelte";

export default function MenuButtonScrollable($$anchor) {
	const actions = Array.from({ length: 20 }, (_, index) => `Action ${index + 1}`);

	MenuButton($$anchor, {
		labelText: 'Actions',
		maxHeight: 240,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => actions, (action) => action, ($$anchor, action) => {
				MenuItem($$anchor, {
					$$events: { click: () => console.log(action) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, action));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}