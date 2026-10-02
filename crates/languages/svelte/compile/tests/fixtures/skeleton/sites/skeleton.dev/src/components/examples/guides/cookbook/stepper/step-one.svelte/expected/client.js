import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full card bg-surface-100-900 p-10 space-y-2 text-center"><h2 class="h3"> </h2> <p>The component contents for <u> </u>.</p></div>`);

export default function Step_one($$anchor, $$props) {
	var div = root();
	var h2 = $.child(div);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var u = $.sibling($.child(p));
	var text_1 = $.only_child(u, true);

	$.next();
	$.reset(p);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.label);
		$.set_text(text_1, $$props.label);
	});

	$.append($$anchor, div);
}