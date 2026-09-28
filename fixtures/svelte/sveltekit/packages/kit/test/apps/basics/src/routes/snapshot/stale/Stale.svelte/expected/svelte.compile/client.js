import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { snapshot } from '$app/navigation';

var root = $.from_html(`<input data-testid="stale-input"/>`);

export default function Stale($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state('');

	snapshot({
		id: 'stale-check',
		capture: () => $.get(value),
		restore: (v) => $.set(value, v, true)
	});

	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, input);
	$.pop();
}