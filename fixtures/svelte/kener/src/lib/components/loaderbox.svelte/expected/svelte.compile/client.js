import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="today-sq animatebg m-px h-2.5 w-2.5"></div>`);

export default function Loaderbox($$anchor) {
	const boxes = Array.from({ length: 24 * 60 }, (_, i) => i);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => boxes, (k) => k, ($$anchor, k) => {
		var div = root();

		$.template_effect(() => $.set_style(div, `animation-delay:${Math.random() * (k * 15)}ms;`));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}