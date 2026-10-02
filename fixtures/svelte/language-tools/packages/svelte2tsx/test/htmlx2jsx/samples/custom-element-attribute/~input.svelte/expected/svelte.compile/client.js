import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<custom-element></custom-element>`, 2);

export default function Input($$anchor) {
	var custom_element = root();

	$.set_custom_element_data(custom_element, 'camelCase', 'true');
	$.set_custom_element_data(custom_element, 'kebab-case', 'true');
	$.set_custom_element_data(custom_element, 'PascalCase', 'true');
	$.set_custom_element_data(custom_element, 'snake_case', 'true');
	$.append($$anchor, custom_element);
}