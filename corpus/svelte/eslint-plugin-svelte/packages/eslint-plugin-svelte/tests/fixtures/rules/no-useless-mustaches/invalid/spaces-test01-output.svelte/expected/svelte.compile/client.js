import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`foo
foo <div data-text="foo '"></div>`,
	1
);

export default function Spaces_test01_output($$anchor) {
	$.next();

	var fragment = root();

	$.next();
	$.append($$anchor, fragment);
}