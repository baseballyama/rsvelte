import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>not actually a link</a> <a href="">invalid</a> <a href="#">invalid</a> <a href="javascript:void(0)">invalid</a> <a name="">invalid</a> <a id="">invalid</a> <a name="fragment">valid</a> <a id="fragment">valid</a>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(14);
	$.append($$anchor, fragment);
}