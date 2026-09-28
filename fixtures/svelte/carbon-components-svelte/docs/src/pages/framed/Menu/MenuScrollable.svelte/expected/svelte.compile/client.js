import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Menu, MenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function MenuScrollable($$anchor) {
	let anchor;
	let open = false;
	const actions = Array.from({ length: 20 }, (_, index) => `Action ${index + 1}`);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		get ref() {
			return anchor;
		},

		set ref($$value) {
			anchor = $$value;
		},
		$$events: { click: () => open = !open },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Actions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Menu(node_1, {
		get anchor() {
			return anchor;
		},
		labelText: 'Actions menu',
		maxHeight: 240,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 16, () => actions, (action) => action, ($$anchor, action) => {
				MenuItem($$anchor, {
					$$events: { click: () => console.log(action) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, action));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}