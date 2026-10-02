import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, MenuButton, MenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<p data-testid="selected-action"> </p>`);

export default function MenuButtonFixture($$anchor) {
	let open = false;
	let selectedAction = "";
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		'data-testid': 'open-externally',
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open externally');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	MenuButton(node_1, {
		labelText: 'Actions',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			MenuItem(node_2, {
				$$events: { click: () => selectedAction = "Cut" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Cut');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			MenuItem(node_3, {
				$$events: { click: () => selectedAction = "Copy" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Copy');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			MenuItem(node_4, {
				$$events: { click: () => selectedAction = "Paste" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Paste');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			MenuItem(node_5, {
				labelText: 'Export as',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					MenuItem(node_6, {
						$$events: { click: () => selectedAction = "PDF" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('PDF');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					MenuItem(node_7, {
						$$events: { click: () => selectedAction = "JPG" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('JPG');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					MenuItem(node_8, {
						$$events: { click: () => selectedAction = "PNG" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('PNG');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_2();
			var text_7 = $.only_child(p);

			$.template_effect(() => $.set_text(text_7, `Selected: ${selectedAction ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node_9, ($$render) => {
			if (selectedAction) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}