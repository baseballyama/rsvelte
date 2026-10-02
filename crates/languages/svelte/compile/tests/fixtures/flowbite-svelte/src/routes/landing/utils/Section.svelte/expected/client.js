import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section><div><!></div></section>`);

export default function Section($$anchor, $$props) {
	let tinted = $.prop($$props, 'tinted', 3, false),
		className = $.prop($$props, 'class', 3, undefined);

	var section = root();
	var div = $.child(section);
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		$.set_class(section, 1, $.clsx(tinted() ? "bg-gray-50 dark:bg-gray-800" : ""));
		$.set_class(div, 1, $.clsx(["mx-auto max-w-screen-xl px-4 py-8 lg:px-4", className()]));
	});

	$.append($$anchor, section);
}