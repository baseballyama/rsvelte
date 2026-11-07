import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img src="foo.jpg" alt="a foo" class="svelte-xawjr2"/>`);

export default function Input($$anchor) {
	var img = root();

	$.append($$anchor, img);
}