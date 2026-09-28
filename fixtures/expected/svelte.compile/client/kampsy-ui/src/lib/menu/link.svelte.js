import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 relative flex w-full cursor-pointer items-center rounded-md bg-transparent px-2 py-3.5 text-sm transition-colors lg:py-2.5"><span><!></span></a>`);

export default function Link($$anchor, $$props) {
	let type = $.prop($$props, 'type', 3, "tertiary"),
		children = $.prop($$props, 'children', 3, undefined);

	const typeObj = {
		primary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		secondary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		tertiary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		error: "text-kui-light-red-800 dark:text-kui-dark-red-800",
		warning: "text-kui-light-amber-800 dark:text-kui-dark-amber-800"
	};

	let typeClass = $.derived(() => {
		return typeObj[type()];
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var span = $.child(a);
			var node_1 = $.child(span);

			$.snippet(node_1, children);
			$.reset(span);
			$.reset(a);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $$props.href);
				$.set_class(span, 1, `first-letter:capitalize ${$.get(typeClass) ?? ''}`);
			});

			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}