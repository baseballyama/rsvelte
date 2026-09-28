import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Input($$anchor) {
	var input = root();

	$.action(input, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'tooltip msg');
	$.append($$anchor, input);
}