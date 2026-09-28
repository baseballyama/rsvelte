import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello</h1> <div class="potato"><p>child element</p> <p>another child element</p></div>`, 1);

export default function Functional_templating($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}