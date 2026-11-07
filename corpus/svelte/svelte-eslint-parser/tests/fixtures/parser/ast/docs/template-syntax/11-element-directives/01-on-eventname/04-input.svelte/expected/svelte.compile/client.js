import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form></form>`);

export default function _4_input($$anchor) {
	var form = root();

	$.event('submit', form, $.preventDefault(handleSubmit));
	$.append($$anchor, form);
}