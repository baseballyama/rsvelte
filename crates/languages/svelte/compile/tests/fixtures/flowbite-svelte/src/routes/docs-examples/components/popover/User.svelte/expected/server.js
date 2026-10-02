import * as $ from 'svelte/internal/server';
import { Popover, Button, Avatar } from "flowbite-svelte";

export default function User($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->User profile`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-64 bg-white text-sm font-light text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<div class="p-3"><div class="mb-2 flex items-center justify-between">`);

			Avatar($$renderer, {
				href: '/',
				src: '/images/profile-picture-1.webp',
				alt: 'Jese Leos'
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Follow`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="text-base leading-none font-semibold text-gray-900 dark:text-white"><a href="/">Jese Leos</a></div> <div class="mb-3 text-sm font-normal"><a href="/" class="hover:underline">@jeseleos</a></div> <div class="mb-4 text-sm font-light">Open-source contributor. Building <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">flowbite.com</a> .</div> <ul class="flex text-sm font-light"><li class="me-2"><a href="/" class="hover:underline"><span class="font-semibold text-gray-900 dark:text-white">799</span> <span>Following</span></a></li> <li><a href="/" class="hover:underline"><span class="font-semibold text-gray-900 dark:text-white">3,758</span> <span>Followers</span></a></li></ul></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}