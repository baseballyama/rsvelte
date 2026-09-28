import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronDownSmall } from "$lib/icons/index.js";

var root = $.from_html(`<div class="h-4 w-4"><div><!></div></div>`);

var root_1 = $.from_html(`<div class="w-full"><div class="box-border flex items-center"><div class="border-kui-light-gray-400 dark:border-kui-dark-gray-400 grow border-t"></div> <div class="grow-0"><button type="button" class="border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-500 dark:hover:border-kui-dark-gray-500 hover:bg-kui-light-gray-200
                dark:hover:bg-kui-dark-gray-200 rounded-full border
                p-1.5 transition duration-300"><div class="flex w-full items-center justify-center gap-1 px-1.5"><div class="text-sm font-medium capitalize"> </div> <!></div></button></div> <div class="border-kui-light-gray-400 dark:border-kui-dark-gray-400 grow border-t"></div></div></div>`);

export default function ShowMore($$anchor, $$props) {
	$.push($$props, true);

	const suffixSnip = ($$anchor) => {
		var div = root();
		var div_1 = $.child(div);
		var node = $.child(div_1);

		ChevronDownSmall(node, {});
		$.reset(div_1);
		$.reset(div);
		$.template_effect(() => $.set_class(div_1, 1, `h-4 w-4 rounded-full ${$.get(rotate) ?? ''} flex transform-gpu items-center justify-center duration-200`));
		$.append($$anchor, div);
	};

	let isActive = $.prop($$props, 'isActive', 15, false);

	const onclick = () => {
		isActive(!isActive());
	};

	let rotate = $.derived(() => {
		if (isActive()) {
			return "rotate-180";
		}

		return "";
	});

	let ariaLabel = $.derived(() => {
		if (isActive()) {
			return "Show less content";
		}

		return "Show more content";
	});

	let buttonText = $.derived(() => {
		if (isActive()) {
			return "show less";
		}

		return "Show more";
	});

	var div_2 = root_1();
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var button = $.child(div_4);
	var div_5 = $.child(button);
	var div_6 = $.child(div_5);
	var text = $.only_child(div_6, true);
	var node_1 = $.sibling(div_6, 2);

	suffixSnip(node_1);
	$.reset(div_5);
	$.reset(button);
	$.reset(div_4);
	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', $.get(ariaLabel));
		$.set_text(text, $.get(buttonText));
	});

	$.delegated('click', button, onclick);
	$.append($$anchor, div_2);
	$.pop();
}

$.delegate(['click']);