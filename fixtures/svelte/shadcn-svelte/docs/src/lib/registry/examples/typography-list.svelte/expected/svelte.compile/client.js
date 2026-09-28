import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<ul class="my-6 ms-6 list-disc [&amp;>li]:mt-2"><li>1st level of puns: 5 gold coins</li> <li>2nd level of jokes: 10 gold coins</li> <li>3rd level of one-liners : 20 gold coins</li></ul>`);

export default function Typography_list($$anchor) {
	var ul = root();

	$.append($$anchor, ul);
}