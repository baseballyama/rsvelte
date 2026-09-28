import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>Label</option></select>`);

export default function Main($$anchor) {
	var select = root();
	var option = $.child(select);

	$.attribute_effect(option, () => ({ ...{ value: 'value', class: 'option' } }));
	$.reset(select);
	$.append($$anchor, select);
}