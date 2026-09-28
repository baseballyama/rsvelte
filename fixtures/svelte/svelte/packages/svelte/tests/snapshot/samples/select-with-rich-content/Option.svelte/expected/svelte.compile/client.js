import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option>Component Option</option>`);

export default function Option($$anchor) {
	var option = root();

	$.append($$anchor, option);
}