import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button asdasd="" asdioqwjdoiqwjd="" qowdjqwoidjqowijdoiqj="">hello very long liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine</button> <span>hello very long liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine</span>`, 1);

export default function Output($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}