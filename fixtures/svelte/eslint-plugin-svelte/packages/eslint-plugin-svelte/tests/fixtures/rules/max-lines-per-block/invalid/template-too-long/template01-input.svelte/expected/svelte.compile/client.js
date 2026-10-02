import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1mujqbb"></h1> <p>Line 1</p> <p>Line 2</p> <p>Line 3</p> <p>Line 4</p> <p>Line 5</p> <p>Line 6</p>`, 1);

export default function Template01_input($$anchor) {
	let name = 'World';
	var fragment = root();
	var h1 = $.first_child(fragment);

	h1.textContent = 'Hello World';
	$.next(12);
	$.append($$anchor, fragment);
}