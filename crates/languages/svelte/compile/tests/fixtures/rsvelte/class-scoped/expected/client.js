import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>expression</p> <p>interpolated</p> <p>directive only</p> <p>static and directive</p> <p>object</p> <p>literal</p> <span class="plain svelte-sdhwnl">static</span> <button>toggle</button>`, 1);

export default function Class_scoped($$anchor) {
	let open = $.state(false);
	let kind = 'info';
	var fragment = root();
	var p = $.first_child(fragment);
	$.set_class(p, 1, $.clsx(kind), 'svelte-sdhwnl');
	var p_1 = $.sibling(p, 2);
	$.set_class(p_1, 1, 'note info svelte-sdhwnl');
	var p_2 = $.sibling(p_1, 2);
	let classes;
	var p_3 = $.sibling(p_2, 2);
	let classes_1;
	var p_4 = $.sibling(p_3, 2);
	var p_5 = $.sibling(p_4, 2);
	$.set_class(p_5, 1, 'fixed &amp; sure svelte-sdhwnl');
	var button = $.sibling(p_5, 4);
	$.template_effect(() => {
		classes = $.set_class(p_2, 1, 'svelte-sdhwnl', null, classes, { open: $.get(open) });
		classes_1 = $.set_class(p_3, 1, 'static svelte-sdhwnl', null, classes_1, { open: $.get(open) });
		$.set_class(p_4, 1, $.clsx({ open: $.get(open) }), 'svelte-sdhwnl');
	});
	$.delegated('click', button, () => $.set(open, !$.get(open)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
