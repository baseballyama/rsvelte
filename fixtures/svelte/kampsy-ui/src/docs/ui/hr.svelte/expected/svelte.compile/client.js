import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 w-full border-t"></div></section>`);

export default function Hr($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, "");
	var section = root();

	$.template_effect(() => $.set_class(section, 1, $.clsx(klass())));
	$.append($$anchor, section);
}