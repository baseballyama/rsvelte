import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { authService } from '$lib/core/services/index.js';
import { toast } from '@misiki/kitcommerce-core';
import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';
import { getUserState } from '$lib/core/stores/index.js';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Creating store...</span>`, 1);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 dark:from-gray-900 dark:to-gray-800" role="main"><div class="grid w-full max-w-4xl items-center gap-8 md:grid-cols-2"><div class="hidden space-y-6 p-8 md:block" aria-hidden="true"><div class="space-y-4"><h1 class="text-4xl font-bold tracking-tighter text-[#1E293B] sm:text-5xl xl:text-6xl/none">Almost there!</h1> <p class="text-lg text-gray-600 dark:text-gray-300">Complete your account details to start setting up your store.</p></div> <div class="space-y-8"><div class="relative"><div class="flex items-center space-x-4"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div> <div><p class="font-medium text-gray-900 dark:text-white">Email verification</p> <p class="text-sm text-gray-500"> </p></div></div></div> <div class="relative"><div class="flex items-center space-x-4"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white"><span class="text-sm font-bold">2</span></div> <div><p class="font-medium text-gray-900 dark:text-white">Account setup</p> <p class="text-sm text-gray-500">Create your login credentials</p></div></div></div></div></div> <div class="w-full max-w-md transform space-y-6 rounded-xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all dark:bg-gray-800/90"><div class="space-y-2"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Complete your details</h2> <p class="text-gray-500 dark:text-gray-400">Fill in your information to create your store</p></div> <form class="space-y-4" aria-label="Store details form"><div class="grid grid-cols-2 gap-4"><!> <!></div> <!> <!> <!> <!></form> <div class="text-center"><button class="text-sm text-gray-500 hover:text-gray-700">← Back to email</button></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const userState = getUserState();
	const IS_DEV = import.meta.env.DEV;
	let firstName = $.state($.proxy(IS_DEV ? 'Swadesh' : ''));
	let lastName = $.state($.proxy(IS_DEV ? 'Behera' : ''));
	let email = $.state($.proxy(IS_DEV ? 'hi1@litekart.in' : ''));
	let phone = $.state($.proxy(IS_DEV ? '+918249028220' : ''));
	let password = $.state($.proxy(IS_DEV ? 'litekart' : ''));
	let confirmPassword = $.state($.proxy(IS_DEV ? 'litekart' : ''));
	let isLoading = $.state(false);

	onMount(() => {
		// Get email from previous step
		const savedEmail = sessionStorage.getItem('signup_email');

		if (!savedEmail) {
			goto('/auth/signup/store');
		}

		$.set(email, savedEmail ?? '', true);
	});

	const schemas = {
		firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
		phone: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number').refine(
			(val) => {
				// Remove any non-digit characters
				const digits = val.replace(/\D/g, '');

				// Check if it's exactly 10 digits or if it starts with country code
				return digits.length === 9 || digits.length > 9 && digits.length <= 17;
			},
			'Please enter a valid phone number'
		),
		password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').refine((val) => val === $.get(password), { message: 'Passwords do not match' })
	};

	async function handleSubmit(e) {
		e.preventDefault();

		try {
			$.set(isLoading, true);

			const res = await authService.joinAsAdmin({
				firstName: $.get(firstName),
				lastName: $.get(lastName),
				businessName: 'Litekart',
				phone: $.get(phone),
				email: $.get(email),
				password: $.get(password),
				origin: page.url.origin
			});

			if (!res?.id) {
				toast.error('Failed to create account');
			}

			// Only clear storage and redirect on success
			sessionStorage.removeItem('signup_email');

			toast.success('Account created successfully');
			goto(`/auth/signup/success?email=${encodeURIComponent($.get(email))}`);
		} catch(e) {
			toast.error(e.message || 'Failed to create account');

			// Don't redirect, let user fix the error and try again
		} finally {
			$.set(isLoading, false);
		}
	}

	var div = root_3();

	$.head('1ipkjju', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `Complete your store setup at ${page?.data?.store?.name ?? ''} and start selling online.`));

		$.deferred_template_effect(() => {
			$.document.title = `Complete Store Setup - ${(page?.data?.store?.name || '') ?? ''}`;
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.sibling($.child(div_5), 2);
	var p = $.sibling($.child(div_6), 2);
	var text = $.only_child(p, true);

	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_4);
	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var div_7 = $.sibling(div_2, 2);
	var form = $.sibling($.child(div_7), 2);
	var div_8 = $.child(form);
	var node = $.child(div_8);

	Textbox(node, {
		name: 'firstName',
		placeholder: 'John',
		get schema() {
			return schemas.firstName;
		},
		label: 'First Name',
		required: true,
		'aria-label': 'First name',
		autocomplete: 'given-name',
		get value() {
			return $.get(firstName);
		},

		set value($$value) {
			$.set(firstName, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Textbox(node_1, {
		name: 'lastName',
		placeholder: 'Doe',
		get schema() {
			return schemas.lastName;
		},
		label: 'Last Name',
		required: true,
		'aria-label': 'Last name',
		autocomplete: 'family-name',
		get value() {
			return $.get(lastName);
		},

		set value($$value) {
			$.set(lastName, $$value, true);
		}
	});

	$.reset(div_8);

	var node_2 = $.sibling(div_8, 2);

	Textbox(node_2, {
		name: 'phone',
		type: 'tel',
		placeholder: '+1234567890',
		get schema() {
			return schemas.phone;
		},
		label: 'Phone number',
		required: true,
		'aria-label': 'Phone number',
		autocomplete: 'tel',
		get value() {
			return $.get(phone);
		},

		set value($$value) {
			$.set(phone, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Textbox(node_3, {
		name: 'password',
		type: 'password',
		placeholder: '••••••••',
		get schema() {
			return schemas.password;
		},
		label: 'Password',
		required: true,
		'aria-label': 'Password',
		autocomplete: 'new-password',
		get value() {
			return $.get(password);
		},

		set value($$value) {
			$.set(password, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Textbox(node_4, {
		name: 'confirmPassword',
		type: 'password',
		placeholder: '••••••••',
		get schema() {
			return schemas.confirmPassword;
		},
		label: 'Confirm password',
		required: true,
		'aria-label': 'Confirm password',
		autocomplete: 'new-password',
		get value() {
			return $.get(confirmPassword);
		},

		set value($$value) {
			$.set(confirmPassword, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => $.get(isLoading) ? 'Creating store...' : 'Create store');

		Button(node_5, {
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
				var node_6 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root_1();
						var node_7 = $.first_child(fragment_1);

						LoaderIcon(node_7, { class: 'mr-2 h-4 w-4 animate-spin', 'aria-hidden': 'true' });
						$.next(2);
						$.append($$anchor, fragment_1);
					};

					$.if(node_6, ($$render) => {
						if ($.get(isLoading)) $$render(consequent);
					});
				}

				var text_1 = $.sibling(node_6);

				$.template_effect(() => $.set_text(text_1, ` ${$.get(isLoading) ? 'Creating store...' : 'Create store'}`));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(form);

	var div_9 = $.sibling(form, 2);
	var button = $.only_child(div_9);

	$.reset(div_7);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(email)));
	$.event('submit', form, handleSubmit);
	$.event('click', button, () => window.location.href = '/auth/signup/store');
	$.append($$anchor, div);
	$.pop();
}