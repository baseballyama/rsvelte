import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { toast } from '@misiki/kitcommerce-core';
import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';
import { getUserState } from '$lib/core/stores/index.js';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import AuthButton from '$lib/components/auth/auth-button.svelte';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<div class="space-y-3"><div class="relative"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200 dark:border-gray-700"></div></div> <div class="relative flex justify-center text-xs"><span class="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">or</span></div></div> <a href="/auth/join-as-vendor" class="inline-flex min-h-11 w-full items-center justify-center rounded-radius border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Join as a vendor">Join as a Vendor</a></div>`);
var root_3 = $.from_html(`<div class="flex min-h-screen items-center justify-center border bg-gray-50 p-3 dark:bg-gray-950 sm:p-4"><div class="w-full max-w-[420px] space-y-4 rounded-radius border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"><div class="space-y-1 text-center"><h2 class="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">Create account</h2> <p class="text-sm text-gray-600 dark:text-gray-300">Save details for faster checkout.</p></div> <form class="space-y-3" aria-label="Sign up form"><div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><!> <!></div> <!> <!> <!> <!></form> <div class="text-center"><p class="text-sm text-gray-600 dark:text-gray-300">Already have an account? <!></p></div> <!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const userState = getUserState();
	const IS_DEV = import.meta.env.DEV;
	let firstName = $.state($.proxy(IS_DEV ? 'Swadesh' : ''));
	let lastName = $.state($.proxy(IS_DEV ? 'Behera' : ''));
	let email = $.state($.proxy(IS_DEV ? 'hi@litekart.in' : ''));

	// let phone = $state(IS_DEV ? '+918249028220' : '')
	let password = $.state($.proxy(IS_DEV ? 'litekart1' : ''));

	let confirmPassword = $.state($.proxy(IS_DEV ? 'litekart1' : ''));
	let isLoading = $.state(false);

	const schemas = {
		firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
		email: z.string().email('Please enter a valid email address').min(5, 'Email must be at least 5 characters').max(100, 'Email must be less than 100 characters'),
		// phone: z
		// 	.string()
		// 	.regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid 10-digit phone number')
		// 	.refine((val) => {
		// 		// Remove any non-digit characters
		// 		const digits = val.replace(/\D/g, '')
		// 		// Check if it's exactly 10 digits or if it starts with country code
		// 		return digits.length === 10 || (digits.length > 9 && digits.length <= 17)
		// 	}, 'Phone number must be 10 digits'),
		password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').refine((val) => val === $.get(password), { message: 'Passwords do not match' })
	};

	async function handleSubmit(e) {
		e.preventDefault();

		try {
			$.set(isLoading, true);

			const ok = await userState.signup({
				firstName: $.get(firstName),
				lastName: $.get(lastName),
				email: $.get(email),
				// phone,
				password: $.get(password),
				origin: page.url.origin
			});

			// signup() swallows its own errors and returns false, so never claim success on a falsy result.
			if (!ok) return;

			toast.success('Account created successfully');
			goto(`/auth/signup/success?email=${encodeURIComponent($.get(email))}`);
		} catch(e) {
			toast.error(e.message);
		} finally {
			$.set(isLoading, false);
		}
	}

	var div = root_3();

	$.head('17eisb9', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `Create your account at ${page?.data?.store?.name ?? ''} to start shopping and discover amazing products.`));

		$.deferred_template_effect(() => {
			$.document.title = `Create Account - ${(page?.data?.store?.name || '') ?? ''}`;
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var form = $.sibling($.child(div_1), 2);
	var div_2 = $.child(form);
	var node = $.child(div_2);

	Textbox(node, {
		name: 'firstName',
		placeholder: 'John',
		get schema() {
			return schemas.firstName;
		},
		label: 'First name',
		class: 'h-12',
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
		label: 'Last name',
		class: 'h-12',
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

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	Textbox(node_2, {
		name: 'email',
		type: 'email',
		placeholder: 'you@example.com',
		get schema() {
			return schemas.email;
		},
		label: 'Email address',
		class: 'h-12',
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

	var node_3 = $.sibling(node_2, 2);

	Textbox(node_3, {
		name: 'password',
		type: 'password',
		placeholder: 'Enter a password',
		get schema() {
			return schemas.password;
		},
		label: 'Password',
		class: 'h-12',
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
		placeholder: 'Confirm your password',
		get schema() {
			return schemas.confirmPassword;
		},
		label: 'Confirm password',
		class: 'h-12',
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
		let $0 = $.derived(() => $.get(isLoading) ? 'Creating account...' : 'Create account');

		Button(node_5, {
			type: 'submit',
			class: 'h-12 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
			get disabled() {
				return $.get(isLoading);
			},

			get 'aria-label'() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_6 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						LoaderIcon($$anchor, { class: 'mr-2 h-5 w-5 animate-spin', 'aria-hidden': 'true' });
					};

					$.if(node_6, ($$render) => {
						if ($.get(isLoading)) $$render(consequent);
					});
				}

				var text = $.sibling(node_6);

				$.template_effect(() => $.set_text(text, ` ${$.get(isLoading) ? 'Creating account...' : 'Create account'}`));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(form);

	var div_3 = $.sibling(form, 2);
	var p = $.child(div_3);
	var node_7 = $.sibling($.child(p));

	AuthButton(node_7, {
		type: 'login',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				variant: 'link',
				class: 'ml-1 inline-flex min-h-10 px-0 font-semibold text-gray-950 transition-colors hover:underline dark:text-white',
				'aria-label': 'Sign in to your account',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Sign in');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(p);
	$.reset(div_3);

	var node_8 = $.sibling(div_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_2();

			$.append($$anchor, div_4);
		};

		$.if(node_8, ($$render) => {
			if (page?.data?.store?.plugins?.isMultiVendor?.active) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.event('submit', form, handleSubmit);
	$.append($$anchor, div);
	$.pop();
}