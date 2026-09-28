import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<div class="flex h-4 w-4 items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<button><!> <span class="first-letter:capitalize"><!></span> <!></button>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	const prefixSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				const Prefix = $.derived(prefix);
				var div = root();
				var node_1 = $.child(div);

				$.component(node_1, () => $.get(Prefix), ($$anchor, Prefix_1) => {
					Prefix_1($$anchor, {});
				});

				$.reset(div);
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if (prefix()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	const suffixSnip = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				const Suffix = $.derived(suffix);
				var div_1 = root();
				var node_3 = $.child(div_1);

				$.component(node_3, () => $.get(Suffix), ($$anchor, Suffix_1) => {
					Suffix_1($$anchor, {});
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			};

			$.if(node_2, ($$render) => {
				if (suffix()) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let onClick = $.prop($$props, 'onClick', 3, undefined),
		type = $.prop($$props, 'type', 3, "tertiary"),
		prefix = $.prop($$props, 'prefix', 3, undefined),
		suffix = $.prop($$props, 'suffix', 3, undefined);

	const rootState = getContext("menu");

	const typeObj = {
		primary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`,

		secondary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`,

		tertiary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`,

		error: `text-kui-light-red-800 dark:text-kui-dark-red-800 
		hover:bg-kui-light-red-100 dark:hover:bg-kui-dark-red-100`,

		warning: `text-kui-light-amber-800 dark:text-kui-dark-amber-800 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`
	};

	let typeClass = $.derived(() => {
		return typeObj[type()];
	});

	let isSuffixClass = $.derived(() => {
		if (suffix()) {
			return "justify-between";
		}

		return "";
	});

	var button = root_1();
	var node_4 = $.child(button);

	prefixSnip(node_4);

	var span = $.sibling(node_4, 2);
	var node_5 = $.child(span);

	$.snippet(node_5, () => $$props.children);
	$.reset(span);

	var node_6 = $.sibling(span, 2);

	suffixSnip(node_6);
	$.reset(button);

	$.template_effect(() => $.set_class(button, 1, `relative flex w-full cursor-pointer items-center gap-2 bg-transparent text-sm transition-colors ${$.get(isSuffixClass) ?? ''} rounded-md
	px-2 py-3.5 lg:py-2.5 ${$.get(typeClass) ?? ''}`));

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