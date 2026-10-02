import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="flexy-dad svelte-z66g28"></div>`);

export default function _Elevation($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();

	$.each(div, 20, () => [...Array(24)].map((_v, i) => i + 1), $.index, ($$anchor, n) => {
		var div_1 = root();
		var text = $.only_child(div_1);

		$.template_effect(() => {
			$.set_class(div_1, 1, `mdc-elevation--z${n ?? ''} flexy-boy`, 'svelte-z66g28');
			$.set_text(text, `Elevation: ${n ?? ''}`);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}