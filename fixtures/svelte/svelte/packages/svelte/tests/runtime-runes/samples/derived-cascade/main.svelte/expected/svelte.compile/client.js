import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let shouldShow01 = $.state(false);
	let der1 = $.derived(() => $.get(shouldShow01));

	// der2 must depend on der1 and its output shouldn't change
	let der2 = $.derived(() => typeof $.get(der1) === "string");

	let der3 = $.derived(() => $.get(der2) ? "1" : "0");

	// der3 must be read before der1
	let der4 = $.derived(() => $.get(der3) + ($.get(der1) ? "1" : "0"));

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(der4)));
	$.delegated('click', button, () => $.set(shouldShow01, true));
	$.append($$anchor, button);
}

$.delegate(['click']);