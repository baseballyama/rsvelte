import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Cross } from "$lib/icons/index.js";
import { clickOutside } from "$lib/utils/event.js";
import { fade, fly } from "svelte/transition";

var root = $.from_html(`<div class="block lg:hidden"><div class="bg-kui-black fixed top-0 left-0 z-1000 h-full w-full opacity-[0.4] lg:hidden"></div> <div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary border-kui-light-gray-200 dark:border-kui-dark-gray-400 fixed top-0 left-0
z-1000 h-full w-[75%] border-r"><div class="absolute top-4 right-5.5 z-30 h-10 w-10"><div class="flex h-full w-full items-center justify-center"><button class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 h-4 w-4"><!></button></div></div> <!></div></div>`);

export default function MobileNavmenu($$anchor, $$props) {
	$.push($$props, true);

	let isOpen = $.prop($$props, 'isOpen', 15, false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.sibling(div_1, 2);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var button = $.child(div_4);
			var node_1 = $.child(button);

			Cross(node_1, {});
			$.reset(button);
			$.reset(div_4);
			$.reset(div_3);

			var node_2 = $.sibling(div_3, 2);

			$.snippet(node_2, () => $$props.asideSlot);
			$.reset(div_2);
			$.action(div_2, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => isOpen(false));
			$.reset(div);
			$.transition(1, div_1, () => fade);
			$.transition(2, div_1, () => fade);
			$.delegated('click', button, () => isOpen(false));
			$.transition(1, div_2, () => fly, () => ({ x: "-100vw", duration: 500, opacity: 1 }));
			$.transition(2, div_2, () => fly, () => ({ x: "-100vw", duration: 500, opacity: 1 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isOpen()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);