import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><a href="/" class="text-sm font-normal text-gray-500 hover:underline dark:text-gray-300"> </a></li>`);
var root_1 = $.from_html(`<footer class="px-4 py-6 md:flex md:items-center md:justify-between md:py-10 2xl:px-0"><p class="mb-4 text-center text-sm text-gray-500 md:mb-0">© 2019-2023 <a href="https://flowbite.com/" class="hover:underline" target="_blank">Flowbite.com</a> . All rights reserved</p> <ul class="flex flex-wrap items-center justify-center gap-6"></ul></footer>`);

export default function Footer($$anchor) {
	var footer = root_1();
	var ul = $.sibling($.child(footer), 2);

	$.each(ul, 20, () => ["Terms", "Licensing", "Cookie Policy", "Contact"], $.index, ($$anchor, elem) => {
		var li = root();
		var a = $.child(li);
		var text = $.only_child(a, true);

		$.reset(li);
		$.template_effect(() => $.set_text(text, elem));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(footer);
	$.append($$anchor, footer);
}