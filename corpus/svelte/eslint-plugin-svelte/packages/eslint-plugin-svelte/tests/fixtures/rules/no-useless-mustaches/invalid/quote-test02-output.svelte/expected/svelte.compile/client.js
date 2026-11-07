import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-text="'&quot;"></div> <div data-text="'&quot;"></div> <div data-text="'&quot;"></div> <div data-text="'&quot;"></div>`, 1);

export default function Quote_test02_output($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}