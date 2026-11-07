import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="bg-primary inline-block size-(--loading-dots-size) rounded-full svelte-k2x6sv"></span>`);
var root_1 = $.from_html(`<div class="inline-flex items-center gap-1 svelte-k2x6sv"></div>`);

export default function Loading_dots($$anchor, $$props) {
	let size = $.prop($$props, 'size', 3, 4);
	var div = root_1();
	let styles;

	$.each(div, 20, () => ({ length: 3 }), $.index, ($$anchor, _) => {
		var span = root();

		$.append($$anchor, span);
	});

	$.reset(div);
	$.template_effect(() => styles = $.set_style(div, '', styles, { '--loading-dots-size': `${size() ?? ''}px` }));
	$.append($$anchor, div);
}