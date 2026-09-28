import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<article></article>`);

export default function Input($$anchor) {
	var article = root();

	$.html(article, () => content, true);
	$.reset(article);
	$.append($$anchor, article);
}