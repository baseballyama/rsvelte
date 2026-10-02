import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="radio" value="Plain"/>`);

export default function Input($$anchor) {
	var input = root();

	$.bind_this(input, ($$value) => element = $$value, () => element);
	$.append($$anchor, input);
}