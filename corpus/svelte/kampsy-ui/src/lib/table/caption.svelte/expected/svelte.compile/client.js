import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<caption><!></caption>`);

export default function Caption($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, ""),
		children = $.prop($$props, 'children', 3, undefined);

	var caption = root();
	var node = $.child(caption);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.reset(caption);
	$.template_effect(() => $.set_class(caption, 1, $.clsx(klass())));
	$.append($$anchor, caption);
}