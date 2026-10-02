import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="mt-8 text-6xl font-bold">🪄 Animotion</p> <p class="mt-16 text-3xl">Learn more by reading the <a class="underline" href="https://animotion.pages.dev/docs" target="_blank">Animotion docs</a>.</p>`, 1);

export default function Slide($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}