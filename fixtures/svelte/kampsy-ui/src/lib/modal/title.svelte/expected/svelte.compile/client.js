import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h3><!></h3>`);

export default function Title($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, "");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var h3 = root();
			var node_1 = $.child(h3);

			$.snippet(node_1, () => $$props.children);
			$.reset(h3);
			$.template_effect(() => $.set_class(h3, 1, `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[24px] leading-[32px] font-semibold ${klass() ?? ''}`));
			$.append($$anchor, h3);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}