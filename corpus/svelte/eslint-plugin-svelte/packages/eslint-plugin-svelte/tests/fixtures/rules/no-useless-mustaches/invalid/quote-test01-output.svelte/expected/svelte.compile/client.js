import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-text="a"></div> <div data-text="a b"></div> <div data-text="ab cd"></div> <div data-text="ab cd"></div> <div data-text="&quot;&lt;br>&quot;"></div>`, 1);

export default function Quote_test01_output($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}