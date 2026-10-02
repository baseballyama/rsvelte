import * as $ from 'svelte/internal/server';

import {
	Package,
	ListTree,
	Tag,
	User,
	ArrowRight,
	Settings,
	Mail,
	Phone,
	Pencil
} from '@lucide/svelte';

import { Button } from '$lib/components/ui/button';
import { getUserState } from '$lib/core/stores/index.js';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const userState = getUserState();

		const importOptions = [
			// {
			// 	title: 'Profile',
			// 	description: 'Your account information',
			// 	icon: User,
			// 	href: '/my/profile'
			// },
			{
				title: 'Orders',
				description: 'List of orders placed',
				icon: Package,
				href: '/my/orders'
			},

			{
				title: 'Wishlist',
				description: 'All wishlisted products',
				icon: ListTree,
				href: '/my/wishlist'
			},

			{
				title: 'Addresses',
				description: 'List of addresses',
				icon: Tag,
				href: '/my/addresses'
			}
		];

		$.head('12jntw7', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>My Dashboard</title>`);
			});
		});

		$$renderer.push(`<div class="mx-auto max-w-7xl px-0 md:py-8 md:py-12">`);

		if (userState?.user) {
			$$renderer.push(`<!--[0--><div class="mb-12 rounded-md border border-gray-200 bg-white p-6 shadow-sm md:p-8"><div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div class="flex items-center gap-4"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-primary">${$.escape(userState.user.firstName?.charAt(0) || 'U')}</div> <div><h2 class="text-2xl font-bold text-gray-900">Hi, ${$.escape(userState.user.firstName || 'User')}!</h2> <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">`);

			if (userState.user.email) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-1.5">`);
				Mail($$renderer, { class: 'h-3.5 w-3.5' });
				$$renderer.push(`<!----> ${$.escape(userState.user.email)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (userState.user.phone) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-1.5">`);
				Phone($$renderer, { class: 'h-3.5 w-3.5' });
				$$renderer.push(`<!----> ${$.escape(userState.user.phone)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div> `);

			Button($$renderer, {
				href: '/my/profile',
				variant: 'outline',
				class: 'flex items-center gap-2',
				children: ($$renderer) => {
					Pencil($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----> Edit Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);

		const each_array = $.ensure_array_like(importOptions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', option.href)} class="flex flex-col rounded-md border border-gray-200 bg-white p-6 shadow-sm transition-all"><div class="mb-4 flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-700 transition-colors group-hover:bg-primary/10 group-hover:text-primary">`);

			if (option.icon) {
				$$renderer.push('<!--[-->');
				option.icon($$renderer, { class: 'h-6 w-6' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="flex items-start justify-between"><h3 class="mb-1 text-lg font-bold text-gray-900">${$.escape(option.title)}</h3> `);

			ArrowRight($$renderer, {
				class: 'h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-primary'
			});

			$$renderer.push(`<!----></div> <p class="text-sm text-gray-500">${$.escape(option.description)}</p></a>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}