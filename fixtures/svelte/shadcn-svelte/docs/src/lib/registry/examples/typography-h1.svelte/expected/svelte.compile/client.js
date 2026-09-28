import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Taxing Laughter: The Joke Tax Chronicles</h1>`);

export default function Typography_h1($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}