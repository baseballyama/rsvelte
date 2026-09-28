import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!doctype html=""/>`);

export default function Input($$anchor) {
	var _doctype = root();

	$.append($$anchor, _doctype);
}