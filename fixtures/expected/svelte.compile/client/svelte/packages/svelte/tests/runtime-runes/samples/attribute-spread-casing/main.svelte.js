import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button> <input/> <input/> <custom-element></custom-element> <custom-element></custom-element> <svg></svg> <svg></svg>`, 3);

export default function Main($$anchor) {
	const disabled = { dIsAbLeD: false };
	const readonly = { readonly: false };
	const readOnly = { readOnly: false };
	var fragment = root();
	var button = $.first_child(fragment);

	$.attribute_effect(button, () => ({ ...disabled }));

	var input = $.sibling(button, 2);

	$.attribute_effect(input, () => ({ ...readonly }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ ...readOnly }), void 0, void 0, void 0, void 0, true);

	var custom_element = $.sibling(input_1, 2);

	$.attribute_effect(custom_element, () => ({ ...readonly }));

	var custom_element_1 = $.sibling(custom_element, 2);

	$.attribute_effect(custom_element_1, () => ({ ...readOnly }));

	var svg = $.sibling(custom_element_1, 2);

	$.attribute_effect(svg, () => ({ ...readonly }));

	var svg_1 = $.sibling(svg, 2);

	$.attribute_effect(svg_1, () => ({ ...readOnly }));
	$.append($$anchor, fragment);
}