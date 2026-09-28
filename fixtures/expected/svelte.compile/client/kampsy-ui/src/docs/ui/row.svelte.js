import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section><!></section>`);

export default function Row($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, ""),
		bottomLine = $.prop($$props, 'bottomLine', 3, true);

	const bottomLineClass = $.derived(() => {
		if (bottomLine()) {
			return "border-b border-kui-light-gray-200 dark:border-kui-dark-gray-400";
		}

		return "";
	});

	var section = root();
	var node = $.child(section);

	$.snippet(node, () => $$props.children);
	$.reset(section);
	$.template_effect(() => $.set_class(section, 1, `p-6 lg:p-12 ${$.get(bottomLineClass) ?? ''} ${klass() ?? ''}`));
	$.append($$anchor, section);
}