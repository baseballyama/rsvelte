import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>typed</div> <div>error</div> <button> </button>`, 1);

export default function Class_ts($$anchor) {
	let active = false;
	let level = $.state(1);
	let tone = 'warm';
	var fragment = root();
	var div = $.first_child(fragment);
	let classes;
	var div_1 = $.sibling(div, 2);
	let classes_1;
	var button = $.sibling(div_1, 2);
	var text = $.only_child(button, true);
	$.template_effect(() => {
		classes = $.set_class(div, 1, $.clsx({ active, [tone]: $.get(level) > 1 }), null, classes, { high: $.get(level) > 2 });
		classes_1 = $.set_class(div_1, 1, '', null, classes_1, { missing: active.length });
		$.set_text(text, $.get(level));
	});
	$.delegated('click', button, () => $.update(level));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
