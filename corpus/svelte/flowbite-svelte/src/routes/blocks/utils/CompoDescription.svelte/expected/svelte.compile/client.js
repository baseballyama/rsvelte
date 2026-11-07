import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><!></p>`);

export default function CompoDescription($$anchor, $$props) {
	let pClass = $.prop($$props, 'pClass', 3, "text-lg text-gray-600 dark:text-gray-400");
	var p = root();
	var node = $.child(p);

	$.snippet(node, () => $$props.children);
	$.reset(p);
	$.template_effect(() => $.set_class(p, 1, $.clsx(pClass())));
	$.append($$anchor, p);
}