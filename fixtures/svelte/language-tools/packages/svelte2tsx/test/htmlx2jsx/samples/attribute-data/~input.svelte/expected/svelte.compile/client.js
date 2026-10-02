import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-bare="" data-bar="to"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.set_attribute(div, 'data-foo', true);
	$.append($$anchor, div);
}