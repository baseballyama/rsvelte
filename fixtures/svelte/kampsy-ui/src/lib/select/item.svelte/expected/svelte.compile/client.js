import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Check } from "$lib/icons/index.js";
import { getContext } from "svelte";
import { fade } from "svelte/transition";

var root = $.from_html(`<div class="absolute right-2"><div class="flex h-full w-full items-center justify-center"><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 h-3.5 w-3.5"><!></div></div></div>`);
var root_1 = $.from_html(`<button class="hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 relative flex w-full cursor-pointer items-center rounded-xs bg-transparent px-2 py-1.5 text-sm transition-colors"><!> <span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 first-letter:capitalize"><!></span></button>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	const rootState = getContext("select");
	var button = root_1();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Check(node_1, {});
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);
			$.transition(3, div, () => fade);
			$.append($$anchor, div);
		};

		var d = $.derived(() => rootState.getSelected() === $$props.value);

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var span = $.sibling(node, 2);
	var node_2 = $.child(span);

	$.snippet(node_2, () => $$props.children);
	$.reset(span);
	$.reset(button);

	$.delegated('click', button, () => {
		rootState.setSelected($$props.value);
		rootState.setIsActive(false);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);