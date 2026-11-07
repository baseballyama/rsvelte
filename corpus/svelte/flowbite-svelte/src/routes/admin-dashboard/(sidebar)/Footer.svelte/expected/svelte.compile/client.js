import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Frame from "./Frame.svelte";

import {
	DiscordSolid,
	DribbbleSolid,
	FacebookSolid,
	GithubSolid,
	TwitterSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<li><a class="mr-4 text-sm font-normal text-gray-500 hover:underline sm:mr-6 dark:text-gray-300"> </a></li>`);
var root_1 = $.from_html(`<a class="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"><!></a>`);
var root_2 = $.from_html(`<ul class="mb-6 flex flex-wrap items-center space-y-1 sm:gap-4 md:mb-0 xl:gap-6"></ul> <div class="flex space-x-6 sm:justify-center"></div>`, 1);
var root_3 = $.from_html(`<!> <p class="my-10 text-center text-sm text-gray-500">© 2019-2023 <a href="https://flowbite.com/" class="hover:underline" target="_blank">Flowbite.com</a> . All rights reserved.</p>`, 1);

export default function Footer($$anchor) {
	const links = [
		{ name: "Terms and conditions", href: "#" },
		{ name: "Privacy Policy", href: "#" },
		{ name: "Licensing", href: "#" },
		{ name: "Cookie Policy", href: "#" },
		{ name: "Contact", href: "#" }
	];

	const brands = [
		[FacebookSolid, ""],
		[DiscordSolid, ""],
		[TwitterSolid, ""],
		[GithubSolid, ""],
		[DribbbleSolid, ""]
	];

	var fragment = root_3();
	var node = $.first_child(fragment);

	Frame(node, {
		tag: 'footer',
		rounded: true,
		shadow: true,
		class: 'mx-4 my-2 rounded-lg bg-white p-4 shadow md:flex md:items-center md:justify-between md:p-6 xl:p-8 dark:bg-gray-800',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var ul = $.first_child(fragment_1);

			$.each(ul, 21, () => links, $.index, ($$anchor, $$item) => {
				let name = () => $.get($$item).name;
				let href = () => $.get($$item).href;
				var li = root();
				var a = $.child(li);
				var text = $.only_child(a, true);

				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(a, 'href', href());
					$.set_text(text, name());
				});

				$.append($$anchor, li);
			});

			$.reset(ul);

			var div = $.sibling(ul, 2);

			$.each(div, 21, () => brands, $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let component = () => $.get($$array)[0];
				let href = () => $.get($$array)[1];
				var a_1 = root_1();
				var node_1 = $.child(a_1);

				$.component(node_1, component, ($$anchor, $$component) => {
					$$component($$anchor, { size: 'md' });
				});

				$.reset(a_1);
				$.template_effect(() => $.set_attribute(a_1, 'href', href()));
				$.append($$anchor, a_1);
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
}