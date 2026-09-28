import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click me!</button>`);

export default function Main($$anchor) {
	let disabled = $.state(false);
	var button = root();

	$.template_effect(() => button.disabled = $.get(disabled));

	$.delegated('mouseup', button, () => {
		$.set(disabled, true);
	});

	$.delegated('click', button, () => {
		console.log('I should not be invoked');
	});

	$.append($$anchor, button);
}

$.delegate(['mouseup', 'click']);