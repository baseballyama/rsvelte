import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboButton, MenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p data-testid="selected-action"> </p>`);
var root_2 = $.from_html(`<!> <p data-testid="primary-clicks"> </p> <!>`, 1);

export default function ComboButtonFixture($$anchor) {
	let primaryClicks = 0;
	let selectedAction = "";
	var fragment = root_2();
	var node = $.first_child(fragment);

	ComboButton(node, {
		labelText: 'Save',
		$$events: { click: () => primaryClicks++ },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			MenuItem(node_1, {
				$$events: { click: () => selectedAction = "Save as" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Save as');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			MenuItem(node_2, {
				$$events: { click: () => selectedAction = "Save a copy" },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Save a copy');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var text_2 = $.only_child(p);
	var node_3 = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root_1();
			var text_3 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_3, `Selected: ${selectedAction ?? ''}`));
			$.append($$anchor, p_1);
		};

		$.if(node_3, ($$render) => {
			if (selectedAction) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text_2, `Primary clicks: ${primaryClicks ?? ''}`));
	$.append($$anchor, fragment);
}