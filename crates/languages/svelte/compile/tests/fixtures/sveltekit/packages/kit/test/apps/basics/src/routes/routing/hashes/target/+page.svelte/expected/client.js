import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ol><li><a href="#p1">first paragraph</a></li> <li><a href="#p2">second paragraph</a></li></ol> <p tabindex="-1" id="p1" class="svelte-4kv4k5">paragraph 1</p> <p tabindex="-1" id="p2" class="svelte-4kv4k5">paragraph 2</p> <li><button>next focus element</button></li>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}