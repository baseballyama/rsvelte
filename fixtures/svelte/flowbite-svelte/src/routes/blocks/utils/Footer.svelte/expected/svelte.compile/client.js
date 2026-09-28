import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";

import {
	Footer,
	FooterBrand,
	FooterCopyright,
	FooterLink,
	FooterLinkGroup
} from "flowbite-svelte";

var root = $.from_html(`<div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white"> </h2> <!></div>`);
var root_1 = $.from_html(`<div class="max-w-8xl mx-auto flex flex-col py-6 lg:py-12"><div><div class="w-full max-w-sm"><!> <p class="mt-4 mb-3 max-w-sm text-gray-600 dark:text-gray-400">Flowbite Svelte is an open-source UI component library built with Svelte components and Tailwind CSS that can help you build websites faster.</p> <p class="mb-3 max-w-sm text-gray-600 dark:text-gray-400">Code licensed <a href="https://github.com/themesberg/flowbite-svelte/blob/main/LICENSE" class="text-primary-600 hover:underline">MIT</a> , docs <a href="https://creativecommons.org/licenses/by/3.0/" class="text-primary-600 hover:underline">CC BY 3.0</a> .</p></div> <div></div></div> <hr class="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700"/> <div class="flex items-center justify-center px-4 text-center"><!></div></div>`);

export default function Footer_1($$anchor, $$props) {
	$.push($$props, true);

	let logo = "/images/flowbite-svelte-icon-logo.svg";
	let isHomePage = $.derived(() => page.route.id === "/");

	const footer_links = {
		Resources: {
			GitHub: "https://github.com/themesberg/flowbite-svelte",
			Flowbite: "https://flowbite.com/",
			"Tailwind CSS": "https://tailwindcss.com/",
			"Figma Design": "https://flowbite.com/figma/"
		},
		"Help and Support": {
			"Discord Community": "https://discord.gg/4eeurUVvTy",
			"GitHub Discussions": "https://github.com/themesberg/flowbite-svelte/discussions"
		},
		Legal: {
			License: "https://github.com/themesberg/flowbite-svelte/blob/main/LICENSE",
			"Brand usage": "https://flowbite.com/brand/"
		}
	};

	Footer($$anchor, {
		footerType: 'logo',
		class: 'bg-white dark:bg-gray-900',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node = $.child(div_2);

			FooterBrand(node, {
				href: 'https://flowbite-svelte.com',
				src: logo,
				alt: 'Flowbite Svelte Logo',
				name: 'Flowbite Svelte',
				class: 'text-gray-900 dark:text-white'
			});

			$.next(4);
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);

			$.each(div_3, 21, () => Object.entries(footer_links), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let column = () => $.get($$array)[0];
				let links = () => $.get($$array)[1];
				var div_4 = root();
				var h2 = $.child(div_4);
				var text = $.only_child(h2, true);
				var node_1 = $.sibling(h2, 2);

				FooterLinkGroup(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 17, () => Object.entries(links()), $.index, ($$anchor, $$item) => {
							var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
							let name = () => $.get($$array_1)[0];
							let href = () => $.get($$array_1)[1];

							FooterLink($$anchor, {
								liClass: 'mb-4',
								get href() {
									return href();
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, name()));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);
				$.template_effect(() => $.set_text(text, column()));
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.reset(div_1);

			var div_5 = $.sibling(div_1, 4);
			var node_3 = $.child(div_5);

			FooterCopyright(node_3, {
				href: '/',
				by: 'Flowbite™',
				copyrightMessage: 'is a registered trademark. All Rights Reserved.'
			});

			$.reset(div_5);
			$.reset(div);

			$.template_effect(() => {
				$.set_class(div_1, 1, `flex flex-col items-start gap-8 md:justify-between lg:flex-row ${$.get(isHomePage) ? 'px-4 lg:px-20' : ''}`);
				$.set_class(div_3, 1, `flex flex-col items-start md:flex-row ${$.get(isHomePage) ? 'gap-4 md:gap-16 lg:justify-end' : 'gap-8'}  w-full`);
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}