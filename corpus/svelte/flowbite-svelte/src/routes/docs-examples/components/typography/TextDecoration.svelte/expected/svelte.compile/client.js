import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="underline dark:text-gray-400">please read our terms and services</p> <p class="line-through dark:text-gray-400">please read our terms and services</p>`, 1);

export default function TextDecoration($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}