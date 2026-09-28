import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<tbody aria-hidden="true" class="table-row h-3"></tbody> <tbody><!></tbody>`, 1);

export default function Body($$anchor, $$props) {
	let striped = $.prop($$props, 'striped', 3, undefined),
		interactive = $.prop($$props, 'interactive', 3, undefined),
		children = $.prop($$props, 'children', 3, undefined);

	let stripedClass = $.derived(() => {
		if (striped()) {
			return `[&_tr:where(:nth-child(odd))]:bg-kui-light-bg-secondary dark:[&_tr:where(:nth-child(odd))]:bg-kui-dark-bg-secondary`;
		}

		return "";
	});

	let interactiveClass = $.derived(() => {
		if (interactive()) {
			return `[&_tr:hover]:bg-kui-light-gray-200 dark:[&_tr:hover]:bg-kui-dark-gray-200`;
		}

		return "";
	});

	let bodyClass = $.derived(() => {
		return `${$.get(stripedClass)} ${$.get(interactiveClass)}`;
	});

	var fragment = root();
	var tbody = $.sibling($.first_child(fragment), 2);
	var node = $.child(tbody);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.reset(tbody);
	$.template_effect(() => $.set_class(tbody, 1, ` ${$.get(bodyClass) ?? ''} [&_td:first-child]:rounded-l [&_td:last-child]:rounded-r`));
	$.append($$anchor, fragment);
}