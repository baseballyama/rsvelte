import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Class01_input($$anchor) {
	var button = root();

	$.delegated('click', button, function (...$$args) {
		(class B {})?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);