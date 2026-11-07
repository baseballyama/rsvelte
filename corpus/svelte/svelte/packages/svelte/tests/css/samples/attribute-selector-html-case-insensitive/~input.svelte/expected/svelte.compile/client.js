import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form method="GET" class="svelte-gbyeyc"><h1 class="svelte-gbyeyc">Hello</h1></form> <form method="POST" class="svelte-gbyeyc"><h1 class="svelte-gbyeyc">World</h1></form> <input type="Text" class="svelte-gbyeyc"/>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}