import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div is="custom-element"></div>`, 2);

export default function Input($$anchor) {
	var div = root();

	$.set_custom_element_data(div, 'camelCase', 'true');
	$.set_custom_element_data(div, 'kebab-case', 'true');
	$.set_custom_element_data(div, 'PascalCase', 'true');
	$.set_custom_element_data(div, 'snake_case', 'true');
	$.append($$anchor, div);
}