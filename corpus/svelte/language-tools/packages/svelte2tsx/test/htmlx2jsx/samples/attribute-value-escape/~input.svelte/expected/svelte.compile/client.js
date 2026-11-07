import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="a\\00a0"></div> <div class="a\\xz"></div> <div class="a\\uz"></div> <div class="a\\"></div> <div class="\\x0000"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}