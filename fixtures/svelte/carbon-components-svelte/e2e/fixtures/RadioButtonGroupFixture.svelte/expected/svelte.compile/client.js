import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioButton, RadioButtonGroup } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <p data-testid="selected-value"> </p>`, 1);

export default function RadioButtonGroupFixture($$anchor) {
	let selected = "one";
	var fragment = root_1();
	var node = $.first_child(fragment);

	RadioButtonGroup(node, {
		'data-testid': 'radio-group-choice',
		legendText: 'Choose one',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			RadioButton(node_1, { value: 'one', labelText: 'Option One' });

			var node_2 = $.sibling(node_1, 2);

			RadioButton(node_2, { value: 'two', labelText: 'Option Two' });

			var node_3 = $.sibling(node_2, 2);

			RadioButton(node_3, { value: 'three', labelText: 'Option Three' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Selected: ${selected ?? ''}`));
	$.append($$anchor, fragment);
}