import * as $ from 'svelte/internal/server';
import { Popover, Button, Avatar } from "flowbite-svelte";

import {
	GlobeOutline,
	HeartSolid,
	ThumbsUpSolid,
	DotsHorizontalOutline
} from "flowbite-svelte-icons";

export default function Company($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Company profile`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		class: 'w-80 text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex"><div class="me-3 shrink-0"><a href="/" class="block rounded-lg bg-gray-100 p-2 dark:bg-gray-700"><img class="h-8 w-8 rounded-full" src="/images/flowbite-svelte-icon-logo.svg" alt="Flowbite logo"/></a></div> <div><p class="mb-1 text-base leading-none font-semibold text-gray-900 dark:text-white"><a href="/" class="hover:underline">Flowbite</a></p> <p class="mb-3 text-sm font-normal">Tech company</p> <p class="mb-4 text-sm font-light">Open-source library of Tailwind CSS components and Figma design system.</p> <ul class="text-sm font-light"><li class="mb-2 flex items-center">`);
			GlobeOutline($$renderer, { class: 'me-2 h-3.5 w-3.5' });
			$$renderer.push(`<!----> <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">https://flowbite.com/</a></li> <li class="mb-2 flex items-start">`);
			HeartSolid($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!----> <span>4,567,346 people like this including 5 of your friends</span></li></ul> <div class="ms-4 mb-3 flex">`);
			Avatar($$renderer, { src: '/images/profile-picture-1.webp', stacked: true });
			$$renderer.push(`<!----> `);
			Avatar($$renderer, { src: '/images/profile-picture-2.webp', stacked: true });
			$$renderer.push(`<!----> `);
			Avatar($$renderer, { src: '/images/profile-picture-3.webp', stacked: true });
			$$renderer.push(`<!----> `);

			Avatar($$renderer, {
				stacked: true,
				href: '/',
				class: 'bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-700',
				children: ($$renderer) => {
					$$renderer.push(`<!---->+3`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex">`);

			Button($$renderer, {
				color: 'alternative',
				class: 'me-2 w-full',
				children: ($$renderer) => {
					ThumbsUpSolid($$renderer, { class: 'me-2' });
					$$renderer.push(`<!----> Like page`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'alternative',
				children: ($$renderer) => {
					DotsHorizontalOutline($$renderer, { class: 'h-3.5 w-3.5' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}