import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, SelectItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<p data-testid="selected-value"> </p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function SelectFixture($$anchor) {
	let selected = "";
	var fragment = root_2();
	var node = $.first_child(fragment);

	Select(node, {
		'data-testid': 'select-country',
		labelText: 'Country',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			SelectItem(node_1, { value: 'us', text: 'United States' });

			var node_2 = $.sibling(node_1, 2);

			SelectItem(node_2, { value: 'uk', text: 'United Kingdom' });

			var node_3 = $.sibling(node_2, 2);

			SelectItem(node_3, { value: 'ca', text: 'Canada' });

			var node_4 = $.sibling(node_3, 2);

			SelectItem(node_4, { value: 'de', text: 'Germany' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `Selected: ${selected ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node_5, ($$render) => {
			if (selected) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}