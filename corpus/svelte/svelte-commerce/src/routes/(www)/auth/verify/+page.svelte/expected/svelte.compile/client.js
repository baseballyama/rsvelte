import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { authService } from '@misiki/kitcommerce-core/services';
import { LoaderCircle } from '@lucide/svelte';
import { getUserState } from '@misiki/kitcommerce-core/stores';
import { goto } from '$app/navigation';

var root = $.from_html(`<div class="flex min-h-[70vh] items-center justify-center px-4"><!></div>`);
var root_1 = $.from_html(`<div class="flex min-h-[70vh] items-center justify-center px-4"><div class="w-full max-w-md space-y-6 text-center"><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 p-3"><svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div> <div class="space-y-4"><h1 class="text-2xl font-bold text-gray-900 md:text-3xl">Email Verification Successful!</h1> <p class="text-gray-600">Thank you for verifying your email. you can now login into your account and start shopping!.</p></div> <div class="pt-4"><!></div></div></div>`);
var root_2 = $.from_html(`<div class="flex min-h-[70vh] items-center justify-center px-4"><div class="w-full max-w-md space-y-6 text-center"><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 p-3"><svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div> <div class="space-y-4"><h1 class="text-2xl font-bold text-gray-900 md:text-3xl">Email Verification Failed!</h1> <p class="text-gray-600">The link you clicked is invalid or expired. Please try again.</p></div> <div class="pt-4"><!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let status = $.state("loading");
	const userState = getUserState();

	onMount(async () => {
		try {
			$.set(status, "loading");

			const email = page.url.searchParams.get('email');
			const token = page.url.searchParams.get('token');

			if (!email || !token) {
				throw Error('Invalid email or token');
			}

			await authService.verifyEmail(email, token);

			if (!userState.user?.role) {
				const { me } = userState.retrieveUserId();

				if (me?.userId) {
					userState.user = me;
				} else {
					userState.user = null;
				}
			}

			$.set(status, "success");
		} catch(e) {
			console.error(e);
			$.set(status, "failed");
		}
	});

	var fragment = $.comment();

	$.head('unpr9c', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Email Verification Successful';
		});
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LoaderCircle(node_1, { class: 'animate-spin' });
			$.reset(div);
			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var div_3 = $.sibling($.child(div_2), 4);
			var node_2 = $.child(div_3);

			Button(node_2, {
				onclick: () => goto('/'),
				variant: 'default',
				class: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Continue Shopping');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_2();
			var div_5 = $.child(div_4);
			var div_6 = $.sibling($.child(div_5), 4);
			var node_3 = $.child(div_6);

			Button(node_3, {
				onclick: () => goto('/'),
				variant: 'default',
				class: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Log in');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if ($.get(status) === 'loading') $$render(consequent); else if ($.get(status) === 'success') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}