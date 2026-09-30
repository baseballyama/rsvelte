import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label for="name">Name &lt;required&gt;</label> <input id="name" required=""/> <p hidden=""> </p>`, 1);

export default function Attrs_svue($$anchor) {
	let value = $.state('');
	let active = $.state(false);

	function onInput(event) {
		$.set(value, event.target.value, true);
	}

	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => {
		$.set_attribute(label, 'data-state', $.get(active) ? 'on' : 'off');
		$.set_value(input, $.get(value));
		$.set_attribute(p, 'data-length', $.get(value).length);
		$.set_text(text, $.get(value));
	});

	$.delegated('input', input, onInput);
	$.event('focus', input, () => $.set(active, true));
	$.append($$anchor, fragment);
}

$.delegate(['input']);