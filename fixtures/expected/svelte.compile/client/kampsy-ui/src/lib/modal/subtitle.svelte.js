import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p aria-labelledby="modal-subtitle"><!></p>`);

export default function Subtitle($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, "");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var node_1 = $.child(p);

			$.snippet(node_1, () => $$props.children);
			$.reset(p);
			$.template_effect(() => $.set_class(p, 1, `text-md text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 leading-6 ${klass() ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}