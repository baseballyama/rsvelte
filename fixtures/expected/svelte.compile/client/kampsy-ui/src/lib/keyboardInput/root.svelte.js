import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<kbd><!></kbd>`);

export default function Root($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var kbd = root();

	$.attribute_effect(kbd, () => ({
		class: 'border-kui-light-gray-200 dark:border-kui-dark-gray-400 inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm\n	border px-1.5 select-none',
		...rest
	}));

	var node = $.child(kbd);

	$.snippet(node, () => $$props.children);
	$.reset(kbd);
	$.append($$anchor, kbd);
}