import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-r070tq">h1</h1> <h2 class="svelte-r070tq">h2</h2> <h3 class="svelte-r070tq">h3</h3> <p class="svelte-r070tq">p</p>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}