import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div style="width:100%; height: 200vh; background-color: goldenrod"></div> <p><a href="#">#</a></p> <p><a href="#top">#top</a></p>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}