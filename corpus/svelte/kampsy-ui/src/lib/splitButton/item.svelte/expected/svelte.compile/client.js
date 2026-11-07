import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<div> </div>`);

var root_1 = $.from_html(`<button class="hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 relative w-full cursor-pointer rounded-md bg-transparent px-2
	py-3.5 text-left text-sm transition-colors lg:py-2.5"><div><!> <!></div></button>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let onClick = $.prop($$props, 'onClick', 3, undefined),
		type = $.prop($$props, 'type', 3, "primary"),
		title = $.prop($$props, 'title', 3, undefined),
		description = $.prop($$props, 'description', 3, undefined);

	const rootState = getContext("split-button");

	const typeTitleObj = {
		primary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		secondary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		tertiary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		error: "text-kui-light-red-800 dark:text-kui-dark-red-800",
		warning: "text-kui-light-amber-800 dark:text-kui-dark-amber-800"
	};

	let typeTitleClass = $.derived(() => {
		return typeTitleObj[type()];
	});

	const typeDescriptionObj = {
		primary: "text-kui-light-gray-900 dark:text-kui-dark-gray-900",
		secondary: "text-kui-light-gray-900 dark:text-kui-dark-gray-900",
		tertiary: "text-kui-light-gray-900 dark:text-kui-dark-gray-900",
		error: "text-kui-light-red-700 dark:text-kui-dark-red-700",
		warning: "text-kui-light-amber-700 dark:text-kui-dark-amber-700"
	};

	let typeDescriptionClass = $.derived(() => {
		return typeDescriptionObj[type()];
	});

	var button = root_1();
	var div = $.child(button);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.template_effect(() => {
				$.set_class(div_1, 1, `text-sm ${$.get(typeTitleClass) ?? ''} leading-5 font-medium`);
				$.set_text(text, title());
			});

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (title()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root();
			var text_1 = $.only_child(div_2, true);

			$.template_effect(() => {
				$.set_class(div_2, 1, `text-sm ${$.get(typeDescriptionClass) ?? ''} leading-5 font-normal`);
				$.set_text(text_1, description());
			});

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (description()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.reset(button);

	$.delegated('click', button, () => {
		if (onClick()) {
			onClick()();
		}

		rootState.setIsActive(false);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);