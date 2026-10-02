import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="snap-start shrink-0 card preset-filled py-20 w-40 md:w-80 text-center"><span></span></div>`);
var root_1 = $.from_html(`<div class="w-full"><div class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-10"></div></div>`);

export default function Default($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 20, () => Array.from({ length: 8 }), $.index, ($$anchor, _, i) => {
		var div_2 = root();
		var span = $.child(div_2);

		span.textContent = i + 1;
		$.reset(div_2);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}