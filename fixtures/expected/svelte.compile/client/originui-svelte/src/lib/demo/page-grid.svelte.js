import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="overflow-hidden"><div class="-m-px grid grid-cols-12 *:px-1 *:py-12 sm:*:px-8 xl:*:px-12 [&amp;_>*:not(:first-child)]:-ms-px [&amp;_>*:not(:first-child)]:-mt-px"><!></div></div>`);

export default function Page_grid($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}