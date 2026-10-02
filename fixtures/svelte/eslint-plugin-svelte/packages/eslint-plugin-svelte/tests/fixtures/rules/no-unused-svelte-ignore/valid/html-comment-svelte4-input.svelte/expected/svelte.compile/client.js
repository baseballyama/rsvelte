import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img src="foo"/>`);

export default function Html_comment_svelte4_input($$anchor) {
	var img = root();

	$.autofocus(img, true);
	$.append($$anchor, img);
}