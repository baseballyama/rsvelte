import * as $ from 'svelte/internal/server';
import Frame from "./Frame.svelte";

import {
	DiscordSolid,
	DribbbleSolid,
	FacebookSolid,
	GithubSolid,
	TwitterSolid
} from "flowbite-svelte-icons";

export default function Footer($$renderer) {
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

	Frame($$renderer, {
		tag: 'footer',
		rounded: true,
		shadow: true,
		class: 'mx-4 my-2 rounded-lg bg-white p-4 shadow md:flex md:items-center md:justify-between md:p-6 xl:p-8 dark:bg-gray-800',
		children: ($$renderer) => {
			$$renderer.push(`<ul class="mb-6 flex flex-wrap items-center space-y-1 sm:gap-4 md:mb-0 xl:gap-6"><!--[-->`);

			const each_array = $.ensure_array_like(links);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { name, href } = each_array[$$index];

				$$renderer.push(`<li><a${$.attr('href', href)} class="mr-4 text-sm font-normal text-gray-500 hover:underline sm:mr-6 dark:text-gray-300">${$.escape(name)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul> <div class="flex space-x-6 sm:justify-center"><!--[-->`);

			const each_array_1 = $.ensure_array_like(brands);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [component, href] = each_array_1[$$index_1];

				$$renderer.push(`<a${$.attr('href', href)} class="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">`);

				if (component) {
					$$renderer.push('<!--[-->');
					component($$renderer, { size: 'md' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="my-10 text-center text-sm text-gray-500">© 2019-2023 <a href="https://flowbite.com/" class="hover:underline" target="_blank">Flowbite.com</a> . All rights reserved.</p>`);
}