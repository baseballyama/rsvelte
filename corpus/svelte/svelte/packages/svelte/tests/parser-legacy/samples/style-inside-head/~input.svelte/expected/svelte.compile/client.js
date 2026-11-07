import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<style></style>`);

export default function Input($$anchor) {
	$.head('f51fzo', ($$anchor) => {
		var style = root();

		$.append($$anchor, style);
	});
}