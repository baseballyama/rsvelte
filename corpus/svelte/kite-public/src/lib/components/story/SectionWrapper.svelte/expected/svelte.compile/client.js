import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <!></section>`);

export default function SectionWrapper($$anchor, $$props) {
	let className = $.prop($$props, 'className', 3, '');
	var section = root();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var node = $.sibling(h3, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(section);

	$.template_effect(() => {
		$.set_class(section, 1, `mt-6 ${className() ?? ''}`);
		$.set_text(text, $$props.title);
	});

	$.append($$anchor, section);
}