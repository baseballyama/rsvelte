import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="image" aria-labeledby="foo"/>`);

export default function Input($$anchor) {
	var input = root();

	$.append($$anchor, input);
}