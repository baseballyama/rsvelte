import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="flex items-center gap-1.5"><!> </div>`);
var root_1 = $.from_html(`<!> Edit Profile`, 1);
var root_2 = $.from_html(`<div class="mb-12 rounded-md border border-gray-200 bg-white p-6 shadow-sm md:p-8"><div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div class="flex items-center gap-4"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-primary"> </div> <div><h2 class="text-2xl font-bold text-gray-900"> </h2> <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500"><!> <!></div></div></div> <!></div></div>`);
var root_3 = $.from_html(`<a class="flex flex-col rounded-md border border-gray-200 bg-white p-6 shadow-sm transition-all"><div class="mb-4 flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-700 transition-colors group-hover:bg-primary/10 group-hover:text-primary"><!></div> <div class="flex items-start justify-between"><h3 class="mb-1 text-lg font-bold text-gray-900"> </h3> <!></div> <p class="text-sm text-gray-500"> </p></a>`);
var root_4 = $.from_html(`<div class="mx-auto max-w-7xl px-0 md:py-8 md:py-12"><!> <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_4();

	$.head('12jntw7', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'My Dashboard';
		});
	});

	var node = $.child(div);

	{
		var consequent_2 = ($$anchor) => {
			var div_1 = root_2();
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var text = $.only_child(div_4, true);
			var div_5 = $.sibling(div_4, 2);
			var h2 = $.child(div_5);
			var text_1 = $.only_child(h2);
			var div_6 = $.sibling(h2, 2);
			var node_1 = $.child(div_6);

			{
				var consequent = ($$anchor) => {
					var div_7 = root();
					var node_2 = $.child(div_7);

					Mail(node_2, { class: 'h-3.5 w-3.5' });

					var text_2 = $.sibling(node_2);

					$.reset(div_7);
					$.template_effect(() => $.set_text(text_2, ` ${userState.user.email ?? ''}`));
					$.append($$anchor, div_7);
				};

				$.if(node_1, ($$render) => {
					if (userState.user.email) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_8 = root();
					var node_4 = $.child(div_8);

					Phone(node_4, { class: 'h-3.5 w-3.5' });

					var text_3 = $.sibling(node_4);

					$.reset(div_8);
					$.template_effect(() => $.set_text(text_3, ` ${userState.user.phone ?? ''}`));
					$.append($$anchor, div_8);
				};

				$.if(node_3, ($$render) => {
					if (userState.user.phone) $$render(consequent_1);
				});
			}

			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_3);

			var node_5 = $.sibling(div_3, 2);

			Button(node_5, {
				href: '/my/profile',
				variant: 'outline',
				class: 'flex items-center gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment = root_1();
					var node_6 = $.first_child(fragment);

					Pencil(node_6, { class: 'h-4 w-4' });
					$.next();
					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_text(text, $0);
					$.set_text(text_1, `Hi, ${(userState.user.firstName || 'User') ?? ''}!`);
				},
				[() => userState.user.firstName?.charAt(0) || 'U']
			);

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (userState?.user) $$render(consequent_2);
		});
	}

	var div_9 = $.sibling(node, 2);

	$.each(div_9, 21, () => importOptions, $.index, ($$anchor, option) => {
		var a = root_3();
		var div_10 = $.child(a);
		var node_7 = $.child(div_10);

		$.component(node_7, () => $.get(option).icon, ($$anchor, $$component) => {
			$$component($$anchor, { class: 'h-6 w-6' });
		});

		$.reset(div_10);

		var div_11 = $.sibling(div_10, 2);
		var h3 = $.child(div_11);
		var text_4 = $.only_child(h3, true);
		var node_8 = $.sibling(h3, 2);

		ArrowRight(node_8, {
			class: 'h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-primary'
		});

		$.reset(div_11);

		var p = $.sibling(div_11, 2);
		var text_5 = $.only_child(p, true);

		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(option).href);
			$.set_text(text_4, $.get(option).title);
			$.set_text(text_5, $.get(option).description);
		});

		$.append($$anchor, a);
	});

	$.reset(div_9);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}