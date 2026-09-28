import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let x = $.state(1);
	let y = $.state(1);
	let z = $.derived(() => $.get(x) * $.get(y));
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(
		// reading a derived value and then setting another source contributing to the derived
		// resulting in the same value should not prevent pending render effects from updating
		z
	)));

	$.delegated('click', button, () => {
		$.set(x, 0);

		// reading a derived value and then setting another source contributing to the derived
		// resulting in the same value should not prevent pending render effects from updating
		$.get(z);

		$.set(y, 0);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);