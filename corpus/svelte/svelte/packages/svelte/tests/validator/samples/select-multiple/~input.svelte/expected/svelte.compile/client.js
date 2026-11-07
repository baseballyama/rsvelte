import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select multiple=""><option>1</option></select>`);

export default function Input($$anchor) {
	let value;
	var select = root();

	$.init_select(select);
	$.bind_select_value(select, () => value, ($$value) => value = $$value);
	$.append($$anchor, select);
}