import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h1>Svelte MapLibre</h1> <p>Svelte MapLibre is a library offering idiomatic Svelte support for the MapLibre GL mapping
  software. Full documentation is coming soon, but in the meantime please check out the examples in
  the menu.</p>`,
	1
);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}