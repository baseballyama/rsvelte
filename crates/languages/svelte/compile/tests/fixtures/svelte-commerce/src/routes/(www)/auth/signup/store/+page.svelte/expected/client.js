import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { toast } from '@misiki/kitcommerce-core';
import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';
import { userService } from '$lib/core/services/index.js';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import AuthButton from '$lib/components/auth/auth-button.svelte';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Creating store...</span>`, 1);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<button class="inline-block text-gray-600 transition-colors hover:text-gray-900 dark:hover:text-gray-300" aria-label="Sign in to your store">Sign in to your store</button>`);
var root_4 = $.from_html(`<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 dark:from-gray-900 dark:to-gray-800" role="main"><div class="grid w-full max-w-4xl items-center gap-8 md:grid-cols-2"><div class="hidden space-y-6 p-8 md:block" aria-hidden="true"><div class="space-y-4"><h1 class="text-4xl font-bold tracking-tighter text-[#1E293B] sm:text-5xl xl:text-6xl/none">Start your business journey</h1> <p class="text-lg text-gray-600 dark:text-gray-300">Create your online store and start selling to customers worldwide.</p></div> <div class="space-y-4"><div class="flex items-center space-x-3"><div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></div> <p class="text-gray-600 dark:text-gray-300">Reach millions of customers</p></div> <div class="flex items-center space-x-3"><div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div> <p class="text-gray-600 dark:text-gray-300">Powerful tools to grow your business</p></div> <div class="flex items-center space-x-3"><div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div> <p class="text-gray-600 dark:text-gray-300">Secure and reliable platform</p></div></div></div> <div class="w-full max-w-md transform space-y-6 rounded-xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all dark:bg-gray-800/90"><div class="space-y-2"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create your store</h2> <p class="text-gray-500 dark:text-gray-400">Enter your email to get started</p></div> <form class="space-y-4" aria-label="Store creation form"><!> <!></form> <div class="space-y-4 text-center"><p class="text-sm text-gray-500">Already have a store?</p> <!></div> <div class="text-center text-xs text-gray-500"><p>By creating a store, you agree to our</p> <div class="space-x-1"><a href="/terms-and-conditions" class="text-gray-600 hover:text-gray-900 dark:hover:text-gray-300">Terms of Service</a> <span>and</span> <a href="/privacy-policy" class="text-gray-600 hover:text-gray-900 dark:hover:text-gray-300">Privacy Policy</a></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let email = $.state('');
	let isLoading = $.state(false);

	const schemas = {
		email: z.string().email('Please enter a valid email address').min(5, 'Email must be at least 5 characters').max(100, 'Email must be less than 100 characters')
	};

	async function handleSubmit(e) {
		e.preventDefault();

		try {
			$.set(isLoading, true);

			// Validate email before proceeding
			const validatedEmail = schemas.email.parse($.get(email));

			// Check if email is available
			const emailCheck = await userService.checkEmail(validatedEmail);

			if (emailCheck && typeof emailCheck === 'object' && 'exists' in emailCheck && emailCheck.exists) {
				toast.error('This email is already registered');

				return;
			}

			// Only proceed if validation passes and email is available
			sessionStorage.setItem('signup_email', validatedEmail);

			goto('/auth/signup/store/details');
		} catch(e) {
			toast.error(e.message);
		} finally {
			$.set(isLoading, false);
		}
	}

	var div = root_4();

	$.head('1rgjizz', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `Start your online business with ${page?.data?.store?.name ?? ''}. Create your store and reach customers worldwide.`));

		$.deferred_template_effect(() => {
			$.document.title = `Create Store - ${(page?.data?.store?.name || '') ?? ''}`;
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var form = $.sibling($.child(div_2), 2);
	var node = $.child(form);

	Textbox(node, {
		name: 'email',
		type: 'email',
		placeholder: 'you@example.com',
		get schema() {
			return schemas.email;
		},
		label: 'Email address',
		required: true,
		'aria-label': 'Email address',
		autocomplete: 'email',
		get value() {
			return $.get(email);
		},

		set value($$value) {
			$.set(email, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(isLoading) ? 'Creating store...' : 'Signup');

		Button(node_1, {
			type: 'submit',
			class: 'w-full',
			get disabled() {
				return $.get(isLoading);
			},

			get 'aria-label'() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_2 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root_1();
						var node_3 = $.first_child(fragment_1);

						LoaderIcon(node_3, { class: 'mr-2 h-4 w-4 animate-spin', 'aria-hidden': 'true' });
						$.next(2);
						$.append($$anchor, fragment_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(isLoading)) $$render(consequent);
					});
				}

				var text = $.sibling(node_2);

				$.template_effect(() => $.set_text(text, ` ${$.get(isLoading) ? 'Creating store...' : 'Signup'}`));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(form);

	var div_3 = $.sibling(form, 2);
	var node_4 = $.sibling($.child(div_3), 2);

	AuthButton(node_4, {
		type: 'login',
		children: ($$anchor, $$slotProps) => {
			var button = root_3();

			$.append($$anchor, button);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.event('submit', form, handleSubmit);
	$.append($$anchor, div);
	$.pop();
}