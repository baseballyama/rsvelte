import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input tabindex="0"/> <input aria-activedescendant="some-id"/> <input aria-activedescendant="some-id"/> <input aria-activedescendant="some-id"/> <input aria-activedescendant="some-id" tabindex="0"/> <input aria-activedescendant="some-id"/> <input aria-activedescendant="some-id" tabindex="-1"/> <!> <div></div> <div aria-activedescendant="some-id" role="tablist"></div> <div aria-activedescendant="some-id" role="tablist" tabindex="-1"></div> <div aria-activedescendant="some-id"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var input = $.sibling($.first_child(fragment), 6);

	$.set_attribute(input, 'tabindex', 0);

	var input_1 = $.sibling(input, 2);

	$.set_attribute(input_1, 'tabindex', 1);

	var input_2 = $.sibling(input_1, 4);

	$.set_attribute(input_2, 'tabindex', -1);

	var node = $.sibling(input_2, 4);

	$.element(node, () => Math.random() ? 'input' : 'button', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ 'aria-activedescendant': 'some-id' }));
	});

	var div = $.sibling(node, 4);

	$.set_attribute(div, 'tabindex', -1);
	$.next(4);
	$.append($$anchor, fragment);
}