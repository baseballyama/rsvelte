import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <!>  <!> <!> <!> <custom-element></custom-element>`, 3);

export default function Input($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	$.set_class(p, 1, foo);

	var node = $.sibling(p, 2);

	$.element(node, () => foo, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ class: foo }));
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, { class: foo });

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => foo, ($$anchor, $$component) => {
		$$component($$anchor, { class: foo });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			Input(node_4, { class: foo });
			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if (foo) $$render(consequent);
		});
	}

	var custom_element = $.sibling(node_3, 2);

	$.set_class(custom_element, 1, foo);
	$.append($$anchor, fragment);
}