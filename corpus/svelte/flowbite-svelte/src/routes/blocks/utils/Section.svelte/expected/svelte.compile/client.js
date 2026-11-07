import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section><div><!></div></section>`);

export default function Section($$anchor, $$props) {
	let tinted = $.prop($$props, 'tinted', 3, false);
	var section = root();
	var div = $.child(section);
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		$.set_class(section, 1, $.clsx(tinted() ? "bg-gray-50 dark:bg-gray-800" : ""));
		$.set_class(div, 1, `max-w-8xl mx-auto px-4 py-8 lg:px-20 ${$$props.class ?? '' ?? ''}`);
	});

	$.append($$anchor, section);
}