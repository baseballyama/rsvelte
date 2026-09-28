import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dev } from "$app/environment";

var root = $.from_html(`<div data-tailwind-indicator="" class="fixed start-1 bottom-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white"><div class="block sm:hidden">xs</div> <div class="hidden sm:block md:hidden">sm</div> <div class="hidden md:block lg:hidden">md</div> <div class="hidden lg:block xl:hidden">lg</div> <div class="hidden xl:block 2xl:hidden">xl</div> <div class="hidden 2xl:block">2xl</div></div>`);

export default function Tailwind_indicator($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (dev) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}