import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, CheckboxGroup } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p data-testid="selected-values"> </p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function CheckboxGroupFixture($$anchor) {
	let selected = [];
	var fragment = root_2();
	var node = $.first_child(fragment);

	CheckboxGroup(node, {
		'data-testid': 'checkbox-group-options',
		legendText: 'Choose options',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, { value: 'a', labelText: 'Option A' });

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, { value: 'b', labelText: 'Option B' });

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, { value: 'c', labelText: 'Option C' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var text = $.only_child(p);

			$.template_effect(($0) => $.set_text(text, `Selected: ${$0 ?? ''}`), [() => selected.join(", ")]);
			$.append($$anchor, p);
		};

		$.if(node_4, ($$render) => {
			if (selected.length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}