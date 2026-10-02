import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>button 1</button> <button>button 2</button> <p id="p">cannot be focused</p> <button id="button3">button 3</button>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}