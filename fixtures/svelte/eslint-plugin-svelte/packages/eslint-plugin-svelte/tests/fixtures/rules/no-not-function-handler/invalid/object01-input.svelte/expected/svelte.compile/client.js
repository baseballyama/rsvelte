import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Object01_input($$anchor) {
	function fn() {}

	var button = root();

	$.event('click', button, function (...$$args) {
		({ fn })?.apply(this, $$args);
	});

	$.append($$anchor, button);
}