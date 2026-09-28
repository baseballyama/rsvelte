import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CloseButton } from "flowbite-svelte";

var root = $.from_html(`<div id="banner" tabindex="-1" class="z-50 flex w-full items-start justify-between gap-8 border border-b border-gray-200 bg-gray-50 px-4 py-3 sm:items-center lg:py-4 dark:border-gray-700 dark:bg-gray-800"><p class="text-sm font-light text-gray-500 dark:text-gray-400">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorem, ipsa culpa ea laudantium earum quis? Neque unde aliquam enim, distinctio repellendus delectus? Illo numquam ex fugit dolor
      esse, cumque nesciunt?</p> <!></div>`);

export default function Default($$anchor) {
	let visible = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.sibling($.child(div), 2);

			CloseButton(node_1, { onclick: () => $.set(visible, false) });
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}