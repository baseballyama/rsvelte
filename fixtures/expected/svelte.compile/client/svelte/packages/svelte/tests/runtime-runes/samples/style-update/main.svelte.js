import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <custom-element></custom-element> <custom-element></custom-element>`, 3);

export default function Main($$anchor, $$props) {
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, () => ({ ...{ style: $$props.style } }));

	var custom_element = $.sibling(div_1, 2);
	var custom_element_1 = $.sibling(custom_element, 2);

	$.attribute_effect(custom_element_1, () => ({ ...{ style: $$props.style } }));

	$.template_effect(() => {
		$.set_style(div, $$props.style);
		$.set_style(custom_element, $$props.style);
	});

	$.append($$anchor, fragment);
}